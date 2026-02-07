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

    async confirmAllocation(organId) {
      const organ = await DonatedOrgan.findById(organId);
      console.log(organ,organId)
      const allocation = await Allocation.findById(organ.allocationId);
    console.log(allocation)
    // const request = await RequestedOrgan.findById(allocation.requestId);

    allocation.status = "MATCHED";
    organ.status = "ALLOCATED";
    // request.status = "MATCHED";

    await allocation.save();
    await organ.save();
    // await request.save();

    const hash =
      this.blockchainService.generateHash({
        allocationId: allocation._id,
        status: "MATCHED",
        previousHash: allocation.lastBlockchainHash,
        timestamp: Date.now()
      });

    const txHash = await this.blockchainService.storeHash(hash);

    allocation.lastBlockchainHash = hash;

    allocation.blockchainHistory.push({
      status: "MATCHED",
      hash,
      txHash,
      timestamp
    });

    await allocation.save();

    await Notification.create({
      userId: request.createdByDoctorId,
      message:
        "Donor has CONFIRMED the organ transplant request.",
      allocationId: allocation._id
    });

    return allocation;
  }

  async rejectAllocation(allocationId) {

    const allocation = await Allocation.findById(allocationId);
    if (!allocation) throw new Error("Allocation not found");

    const organ = await DonatedOrgan.findById(allocation.organId);
    const request = await RequestedOrgan.findById(allocation.requestId);

    allocation.status = "REJECTED";
    organ.status = "AVAILABLE";
    request.status = "WAITING";
    request.allocationId = null;

    await allocation.save();
    await organ.save();
    await request.save();

    await Notification.create({
      userId: request.createdByDoctorId,
      message:
        "Donor has REJECTED the transplant request. Organ returned to pool.",
      allocationId: allocation._id
    });

    return allocation;
  }

  async findAll(donorId) {
    try {
      return await this.DonorRepository.findAll(donorId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = DonorService;
