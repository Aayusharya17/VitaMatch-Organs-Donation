const DoctorRepository = require('../repository/doctorRepo');
const Allocation = require("../models/Allocation");
const DonatedOrgan = require("../models/DonatedOrgan");
const RequestedOrgan = require("../models/RequestedOrgan");
const Notification = require("../models/Notification");
const DistanceService = require("./distanceService");
const User = require("../models/User");
const MatchScoreService = require("./matchScoreService");
const { validateAllocationTransition } = require("./allocationStateService");
const BlockchainService = require("./blockchainService");

class DoctorService {

  constructor() {
    this.DoctorRepository = new DoctorRepository();
    this.distanceService = new DistanceService();
    this.matchScoreService = new MatchScoreService();
    this.blockchainService = new BlockchainService();
  }

  async requestOrgan(data) {
    try {
      return await this.DoctorRepository.createRequest(data);
    } catch (error) {
      console.error("Service error requesting organ:", error);
      throw error;
    }
  }

  async findAllAvailable(data, doctorId) {
    try {
      const organs = await this.DoctorRepository.findAllAvailable(data);

      const doctor = await User.findById(doctorId);

      if (!doctor || !doctor.location) {
        throw new Error("Doctor location missing");
      }

      const enrichedOrgans = await Promise.all(
        organs.map(async (organ) => {

          if (!organ.location) {
            return {
              ...organ.toObject(),
              distance: null,
              duration: null,
              distanceKm: null,
              matchScore: 0,
              riskLevel: "UNKNOWN",
              recommendation: "INSUFFICIENT_DATA"
            };
          }

          const route = await this.distanceService.getDistance(
            doctor.location,
            organ.location
          );

          const distanceKm = route.distance ? parseFloat(route.distance) : null;

          const scoreData = this.matchScoreService.calculateScore({
            organName: organ.organName,
            urgencyScore: Number(data.urgencyScore || 5),
            distanceKm
          });

          return {
            ...organ.toObject(),
            distance: route.distance,
            duration: route.duration,
            distanceKm,
            matchScore: scoreData.matchScore,
            riskLevel: scoreData.riskLevel,
            recommendation: scoreData.recommendation,
            requestId: null // This will be used when accepting
          };
        })
      );

      // Sort by match score descending
      enrichedOrgans.sort((a, b) => b.matchScore - a.matchScore);

      return enrichedOrgans;
    } catch (error) {
      console.error("Service error finding available organs:", error);
      throw error;
    }
  }

  async acceptOrgan({ organId, requestId, user }) {
  try {
    const organ = await DonatedOrgan
      .findById(organId)
      .populate("consentId");

    if (!organ) throw new Error("Organ not found");

    if (organ.status !== "AVAILABLE") {
      throw new Error("Organ is not available for allocation");
    }

    if (!organ.consentId || organ.consentId.status !== "VERIFIED") {
      throw new Error("Organ consent not verified");
    }

    const doctor = await User.findById(user.id);

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    if (!doctor.hospitalId) {
      throw new Error("Doctor must be associated with a hospital");
    }

    let request;
    let hospitalId;

    // If request exists → use request hospital
    if (requestId) {
      request = await RequestedOrgan.findById(requestId);
      if (!request) {
        throw new Error("Request not found");
      }

      hospitalId = request.hospitalId;
    } else {
      // otherwise use doctor's hospital
      hospitalId = doctor.hospitalId;
    }

    const allocation = await Allocation.create({
      organId,
      requestId: requestId || null,
      hospitalId,
      matchScore: 100,
      status: "PENDING_CONFIRMATION"
    });

    // Blockchain
    const timestamp = Date.now();
    const hash = this.blockchainService.generateHash({
      allocationId: allocation._id.toString(),
      status: "PENDING_CONFIRMATION",
      previousHash: null,
      timestamp
    });

    const txHash = await this.blockchainService.storeHash(hash);

    allocation.lastBlockchainHash = hash;
    allocation.blockchainHistory.push({
      status: "PENDING_CONFIRMATION",
      hash,
      txHash,
      timestamp: new Date(timestamp)
    });

    await allocation.save();

    // Update organ
    organ.allocationId = allocation._id;
    organ.status = "RESERVED";
    await organ.save();

    // Update request
    if (request) {
      request.status = "PENDING_CONFIRMATION";
      request.allocationId = allocation._id;
      await request.save();
    }

    // Notify donor
    await Notification.create({
      userId: organ.donorId,
      message:
        "A hospital has requested your donated organ. Please confirm or reject the allocation.",
      allocationId: allocation._id
    });

    return allocation;

  } catch (error) {
    console.error("Service error accepting organ:", error);
    throw error;
  }
}

  async getDoctorAllocations(doctorId, status) {
    try {
      return await this.DoctorRepository.getDoctorAllocations(doctorId, status);
    } catch (error) {
      console.error("Service error getting allocations:", error);
      throw error;
    }
  }

  async validateDoctorOwnership(allocationId, doctorId) {
    const allocation = await Allocation.findById(allocationId);
    if (!allocation) throw new Error("Allocation not found");

    const doctor = await User.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");

    if (doctor.role !== "DOCTOR") {
      throw new Error("Only doctors can perform this action");
    }

    if (
      !doctor.hospitalId ||
      allocation.hospitalId.toString() !== doctor.hospitalId.toString()
    ) {
      throw new Error("You are not authorized to access this allocation");
    }

    return allocation;
  }

  async completeAllocation(allocationId, doctorId) {
    try {
      const allocation = await this.validateDoctorOwnership(allocationId, doctorId);

      validateAllocationTransition(allocation.status, "COMPLETED");

      const organ = await DonatedOrgan.findById(allocation.organId);
      const request = await RequestedOrgan.findById(allocation.requestId);

      if (!organ) throw new Error("Organ not found");

      // Update allocation
      allocation.status = "COMPLETED";
      allocation.completionTime = new Date();
      allocation.completedBy = doctorId;

      // Update organ
      organ.status = "TRANSPLANTED";

      // Update request if exists
      if (request) {
        request.status = "TRANSPLANTED";
        await request.save();
      }

      await allocation.save();
      await organ.save();

      // Blockchain recording
      const timestamp = Date.now();
      const hash = this.blockchainService.generateHash({
        allocationId: allocation._id.toString(),
        status: "COMPLETED",
        previousHash: allocation.lastBlockchainHash,
        timestamp
      });

      const txHash = await this.blockchainService.storeHash(hash);

      allocation.lastBlockchainHash = hash;
      allocation.blockchainHistory.push({
        status: "COMPLETED",
        hash,
        txHash,
        timestamp: new Date(timestamp)
      });

      await allocation.save();

      // Notify donor
      await Notification.create({
        userId: organ.donorId,
        message: "Your organ donation has been successfully transplanted. Thank you for saving a life!",
        allocationId: allocation._id
      });

      return allocation;
    } catch (error) {
      console.error("Service error completing allocation:", error);
      throw error;
    }
  }

  async failAllocation(allocationId, reason, doctorId) {
    try {
      const allocation = await this.validateDoctorOwnership(allocationId, doctorId);

      validateAllocationTransition(allocation.status, "FAILED");

      const organ = await DonatedOrgan.findById(allocation.organId);
      const request = await RequestedOrgan.findById(allocation.requestId);

      if (!organ) throw new Error("Organ not found");

      // Update allocation
      allocation.status = "FAILED";
      allocation.failureReason = reason;

      // Return organ to available pool
      organ.status = "AVAILABLE";
      organ.allocationId = null;

      // Return request to waiting if exists
      if (request) {
        request.status = "WAITING";
        request.allocationId = null;
        await request.save();
      }

      await allocation.save();
      await organ.save();

      // Blockchain recording
      const timestamp = Date.now();
      const hash = this.blockchainService.generateHash({
        allocationId: allocation._id.toString(),
        status: "FAILED",
        previousHash: allocation.lastBlockchainHash,
        timestamp
      });

      const txHash = await this.blockchainService.storeHash(hash);

      allocation.lastBlockchainHash = hash;
      allocation.blockchainHistory.push({
        status: "FAILED",
        hash,
        txHash,
        timestamp: new Date(timestamp)
      });

      await allocation.save();

      // Notify donor
      await Notification.create({
        userId: organ.donorId,
        message: `Allocation failed: ${reason}. Your organ has been returned to the available pool.`,
        allocationId: allocation._id
      });

      return allocation;
    } catch (error) {
      console.error("Service error failing allocation:", error);
      throw error;
    }
  }

  async viewRequest(requestId) {
    try {
      const response = await this.DoctorRepository.viewRequest(requestId);
      if (!response) {
        throw new Error("Request not found");
      }
      return response;
    } catch (error) {
      console.error("Service error viewing request:", error);
      throw error;
    }
  }

  async doctorDashboard(doctorId) {
    try {
      const myRequests = await this.DoctorRepository.getDoctorRequests(doctorId);
      const hospitalRequests = await this.DoctorRepository.getHospitalRequests(doctorId);
      const counts = await this.DoctorRepository.getDoctorDashboardCounts(doctorId);

      return {
        ...counts,
        myRequests,
        hospitalRequests
      };
    } catch (error) {
      console.error("Service error getting dashboard:", error);
      throw error;
    }
  }
}

module.exports = DoctorService;