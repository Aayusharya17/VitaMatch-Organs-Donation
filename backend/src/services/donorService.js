const Allocation = require("../models/Allocation");
const RequestedOrgan = require("../models/RequestedOrgan");
const User = require("../models/User");
const DonorRepository = require("../repository/donorRepo");
const requestOrgan = require("../repository/doctorRepo");
const userRepository = require("../repository/userRepo");
const Notification = require("../models/Notification");
const DonatedOrgan = require("../models/DonatedOrgan");
const GeocodingService = require("./geocodingService");
const BlockchainService = require("./blockchainService");
const { validateAllocationTransition } = require("./allocationStateService");

class DonorService {

  constructor() {
    this.userRepository = new userRepository();
    this.DonorRepository = new DonorRepository();
    this.requestOrganRepo = new requestOrgan();
    this.geocodingService = new GeocodingService();
    this.blockchainService = new BlockchainService();
  }

  async createDonation(data) {
    const donor = await User.findById(data.donorId);
    if (!donor) throw new Error("Donor not found");

    data.address = donor.address;
    data.location = donor.location;
    data.phoneNumber = donor.phoneNumber;

    return await this.DonorRepository.createDonation(data);
  }

  async confirmDonation(donatedOrganId, donorId, consentType) {
    try {
      return await this.DonorRepository.confirmDonation(
        donatedOrganId,
        donorId,
        consentType
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllRequests(data) {
    try {
      return await this.DonorRepository.findAllRequests(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async confirmAllocation(allocationId, donorId) {
    try {
      const allocation = await Allocation.findById(allocationId);
      if (!allocation) throw new Error("Allocation not found");

      const organ = await DonatedOrgan.findById(allocation.organId);
      if (!organ) throw new Error("Organ not found");

      // FIXED: Add ownership validation
      if (organ.donorId.toString() !== donorId.toString()) {
        throw new Error("Unauthorized: You can only confirm your own organ donations");
      }

      // FIXED: Add state transition validation
      validateAllocationTransition(allocation.status, "MATCHED");

      const request = await RequestedOrgan.findById(allocation.requestId);

      allocation.status = "MATCHED";
      organ.status = "ALLOCATED";

      await organ.save();

      // Blockchain recording
      const timestamp = Date.now();
      const hash = this.blockchainService.generateHash({
        allocationId: allocation._id.toString(),
        status: "MATCHED",
        previousHash: allocation.lastBlockchainHash,
        timestamp
      });

      const txHash = await this.blockchainService.storeHash(hash);

      allocation.lastBlockchainHash = hash;
      allocation.blockchainHistory.push({
        status: "MATCHED",
        hash,
        txHash,
        timestamp: new Date(timestamp)
      });

      await allocation.save();
      
      if (request) {
        await Notification.create({
          userId: request.doctorId,
          message: "Donor confirmed transplant request.",
          allocationId: allocation._id
        });
      }
      
      return allocation;
    } catch (error) {
      console.error("Service error confirming allocation:", error);
      throw error;
    }
  }

  async rejectAllocation(allocationId, donorId) {
    try {
      const allocation = await Allocation.findById(allocationId);
      if (!allocation) throw new Error("Allocation not found");

      const organ = await DonatedOrgan.findById(allocation.organId);
      if (!organ) throw new Error("Organ not found");

      // FIXED: Add ownership validation
      if (organ.donorId.toString() !== donorId.toString()) {
        throw new Error("Unauthorized: You can only reject your own organ donations");
      }

      // FIXED: Add state transition validation
      validateAllocationTransition(allocation.status, "REJECTED");

      const request = await RequestedOrgan.findById(allocation.requestId);

      allocation.status = "REJECTED";
      organ.status = "AVAILABLE";
      organ.allocationId = null;

      if (request) {
        request.status = "WAITING";
        request.allocationId = null;
        await request.save();
      }

      await allocation.save();
      await organ.save();

      // FIXED: Add blockchain recording for rejection
      const timestamp = Date.now();
      const hash = this.blockchainService.generateHash({
        allocationId: allocation._id.toString(),
        status: "REJECTED",
        previousHash: allocation.lastBlockchainHash,
        timestamp
      });

      const txHash = await this.blockchainService.storeHash(hash);

      allocation.lastBlockchainHash = hash;
      allocation.blockchainHistory.push({
        status: "REJECTED",
        hash,
        txHash,
        timestamp: new Date(timestamp)
      });

      await allocation.save();

      if (request) {
        await Notification.create({
          userId: request.doctorId,
          message: "Donor has REJECTED the transplant request. Organ returned to pool.",
          allocationId: allocation._id
        });
      }

      return allocation;
    } catch (error) {
      console.error("Service error rejecting allocation:", error);
      throw error;
    }
  }

  async findAll(donorId) {
    try {
      return await this.DonorRepository.findAll(donorId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async acceptOrganById({ organId, donorId }) {
    try {
      const requestId = organId;
      console.log("Request ID: ", requestId, "\n");
      
      // Find the requested organ (hospital request)
      const requestedOrgan = await this.DonorRepository.findByOrganId(requestId);

      if (!requestedOrgan) throw new Error("Requested organ not found");
      
      // Check if already matched
      if (requestedOrgan.status === "MATCHED") {
        throw new Error("This organ request is already matched");
      }

      // Get donor information
      const donor = await User.findById(donorId);
      if (!donor) throw new Error("Donor not found");

      const donatedOrgan = await DonatedOrgan.create({
        organName: requestedOrgan.organName,
        bloodGroup: requestedOrgan.bloodGroup,
        donorId: donorId,
        role: "DONOR",
        hospitalId: requestedOrgan.hospitalId,
        address: donor.address,
        location: donor.location,
        phoneNumber: donor.phoneNumber,
        status: "RESERVED"
      });

      const allocation = await Allocation.create({
        requestId: requestId,
        organId: donatedOrgan._id,
        hospitalId: requestedOrgan.hospitalId,
        matchScore: 100,
        status: "PENDING_CONFIRMATION"
      });

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

      // Update donated organ with allocation
      donatedOrgan.allocationId = allocation._id;
      await donatedOrgan.save();

      // Update requested organ status
      requestedOrgan.status = "MATCHED";
      requestedOrgan.allocationId = allocation._id;
      await requestedOrgan.save();

      // Create notification for the doctor
      await Notification.create({
        userId: requestedOrgan.doctorId,
        message: `A donor has accepted your organ request for ${requestedOrgan.organName}`,
        allocationId: allocation._id
      });

      console.log("Donated Organ:", donatedOrgan);
      console.log("Allocation:", allocation);

      return {
        donatedOrgan,
        allocation,
        requestedOrgan
      };

    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = DonorService;