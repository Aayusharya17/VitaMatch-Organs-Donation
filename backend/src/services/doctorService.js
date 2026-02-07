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
    return await this.DoctorRepository.createRequest(data);
  }

  async findAllAvailable(data, doctorId) {

    const organs =
      await this.DoctorRepository.findAllAvailable(data);

    const doctor = await User.findById(doctorId);

    if (!doctor || !doctor.location)
      throw new Error("Doctor location missing");

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

        const route =
          await this.distanceService.getDistance(
            doctor.location,
            organ.location
          );

        const distanceKm =
          route.distance ? parseFloat(route.distance) : null;

        const scoreData =
          this.matchScoreService.calculateScore({
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
          recommendation: scoreData.recommendation
        };
      })
    );

    enrichedOrgans.sort((a, b) => b.matchScore - a.matchScore);

    return enrichedOrgans;
  }

  async acceptOrgan({ organId, requestId ,user}) {

    const organ =
      await DonatedOrgan.findById(organId).populate("consentId");
    console.log(organ);
    if (!organ) throw new Error("Organ not found");
    if (organ.status !== "AVAILABLE")
      throw new Error("Organ not available");

    if (!organ.consentId ||
      organ.consentId.status !== "VERIFIED")
      throw new Error("Consent not verified");

    let request =
      await RequestedOrgan.findById(requestId);
    

    if (!request){
      request={};
      request.hospitalId = user.hospitalId;
    }
    // if (request.status !== "WAITING")
    //   throw new Error("Request not valid");

    const allocation = await Allocation.create({
      organId,
      requestId,
      hospitalId: request.hospitalId,
      matchScore: 100,
      status: "PENDING_CONFIRMATION"
    });
    
    organ.allocationId = allocation._id;
    organ.status = "RESERVED";
    request.status = "PENDING_CONFIRMATION";
    request.allocationId = allocation._id;

    await organ.save();
    // await request.save();

    await Notification.create({
      userId: organ.donorId,
      message: "Hospital has requested transplant. Confirm or reject.",
      allocationId: allocation._id
    });

    return allocation;
  }

  async getDoctorAllocations(doctorId, status) {
    return await this.DoctorRepository
      .getDoctorAllocations(doctorId, status);
  }

  async validateDoctorOwnership(allocationId, doctorId) {

    const allocation = await Allocation.findById(allocationId);
    if (!allocation) throw new Error("Allocation not found");

    const doctor = await User.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");

    if (doctor.role !== "DOCTOR")
      throw new Error("Only doctors allowed");

    if (
      !doctor.hospitalId ||
      allocation.hospitalId.toString() !==
      doctor.hospitalId.toString()
    ) {
      throw new Error("Unauthorized hospital access");
    }

    return allocation;
  }

  async dispatchOrgan(allocationId, doctorId) {

    const allocation =
      await this.validateDoctorOwnership(allocationId, doctorId);

    validateAllocationTransition(
      allocation.status,
      "DISPATCHED"
    );

    allocation.status = "DISPATCHED";
    allocation.dispatchTime = new Date();
    allocation.dispatchedBy = doctorId;

    await allocation.save();

    const timestamp = new Date();

    const hash =
      this.blockchainService.generateHash({
        allocationId: allocation._id.toString(),
        status: "DISPATCHED",
        previousHash: allocation.lastBlockchainHash,
        timestamp
      });

    const txHash =
      await this.blockchainService.storeHash(hash);

    allocation.lastBlockchainHash = hash;

    allocation.blockchainHistory.push({
      status: "DISPATCHED",
      hash,
      txHash,
      timestamp
    });

    await allocation.save();

    return allocation;
  }

  async completeAllocation(allocationId, doctorId) {

    const allocation =
      await this.validateDoctorOwnership(allocationId, doctorId);

    validateAllocationTransition(
      allocation.status,
      "COMPLETED"
    );

    const organ =
      await DonatedOrgan.findById(allocation.organId);

    const request =
      await RequestedOrgan.findById(allocation.requestId);

    allocation.status = "COMPLETED";
    allocation.completionTime = new Date();
    allocation.completedBy = doctorId;

    organ.status = "TRANSPLANTED";
    request.status = "TRANSPLANTED";

    await allocation.save();
    await organ.save();
    await request.save();

    const timestamp = new Date();

    const hash =
      this.blockchainService.generateHash({
        allocationId: allocation._id.toString(),
        status: "COMPLETED",
        previousHash: allocation.lastBlockchainHash,
        timestamp
      });

    const txHash =
      await this.blockchainService.storeHash(hash);

    allocation.lastBlockchainHash = hash;

    allocation.blockchainHistory.push({
      status: "COMPLETED",
      hash,
      txHash,
      timestamp
    });

    await allocation.save();

    return allocation;
  }

  async failAllocation(allocationId, reason, doctorId) {

    const allocation =
      await this.validateDoctorOwnership(allocationId, doctorId);

    validateAllocationTransition(
      allocation.status,
      "FAILED"
    );

    const organ =
      await DonatedOrgan.findById(allocation.organId);

    const request =
      await RequestedOrgan.findById(allocation.requestId);

    allocation.status = "FAILED";
    allocation.failureReason = reason;

    organ.status = "AVAILABLE";
    request.status = "WAITING";
    request.allocationId = null;

    await allocation.save();
    await organ.save();
    await request.save();

    const timestamp = new Date();

    const hash =
      this.blockchainService.generateHash({
        allocationId: allocation._id.toString(),
        status: "FAILED",
        previousHash: allocation.lastBlockchainHash,
        timestamp
      });

    const txHash =
      await this.blockchainService.storeHash(hash);

    allocation.lastBlockchainHash = hash;

    allocation.blockchainHistory.push({
      status: "FAILED",
      hash,
      txHash,
      timestamp
    });

    await allocation.save();

    return allocation;
  }

  async doctorDashboard(doctorId) {
    const myRequests =
      await this.DoctorRepository.getDoctorRequests(doctorId);

    const hospitalRequests =
      await this.DoctorRepository.getHospitalRequests(doctorId);

    const counts =
      await this.DoctorRepository.getDoctorDashboardCounts(doctorId);

    return {
      ...counts,
      myRequests,
      hospitalRequests
    };
  }
}

module.exports = DoctorService;
