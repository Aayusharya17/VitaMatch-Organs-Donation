const Consent = require("../models/Consent");
const DonatedOrgan = require("../models/DonatedOrgan");
const RequestedOrgan = require("../models/RequestedOrgan");
const User = require("../models/User");
const Hospital = require("../models/Hospital");

class DonorRepository {

  async createDonation(data) {
    try {
        const donorUser = await User.findById(data.donorId);
        if (!donorUser) throw new Error("Donor not found");

        data.phoneNumber = donorUser.phoneNumber;

        const donation = await DonatedOrgan.create(data);

        if (data.hospitalId) {
            await Hospital.findByIdAndUpdate(
                data.hospitalId,
                { $push: { donate: donation._id } }
            );
        }

        return donation;

    } catch (error) {
        console.error("Repository error creating donation:", error);
        throw new Error("Problem creating donation");
    }
  }

  async confirmDonation(donatedOrganId, donorId, consentType) {
    try {
      console.log("Donated organ ID: ", donatedOrganId, "\n");
      const organ = await DonatedOrgan.findById(donatedOrganId);

      if (!organ) throw new Error("Organ not found");

      // Verify ownership
      if (organ.donorId.toString() !== donorId.toString()) {
        throw new Error("Unauthorized: You can only confirm your own donations");
      }

      const consent = await Consent.create({
        donorId,
        consentType,
        status: "VERIFIED"
      });

      organ.status = "AVAILABLE";
      organ.consentId = consent._id;
      await organ.save();

      return organ;

    } catch (error) {
      console.error("Repository error confirming donation:", error);
      throw error;
    }
  }

  async findAllRequests(data) {
    try {
        const query = { status: "WAITING" };
        
        if (data.organName) {
            query.organName = data.organName;
        }
        
        if (data.bloodGroup) {
            query.bloodGroup = data.bloodGroup;
        }
        
        const requests = await RequestedOrgan.find(query)
            .populate('hospitalId', 'name address')
            .populate('doctorId', 'name email phoneNumber')
            .sort({ createdAt: -1 });
            
        return requests;
    } catch (error) {
        console.error("Repository error finding requests:", error);
        throw error;
    }
  }

  async findAll(donorId) {
    try {
        const all = await DonatedOrgan.find({ donorId })
            .populate('hospitalId', 'name address')
            .populate('allocationId')
            .sort({ createdAt: -1 });
        return all;
    } catch (error) {
        console.error("Repository error finding all donations:", error);
        throw error;
    }
  }

  async findByOrganId(organId) {
    try {
        console.log("Finding organ by ID:", organId, "\n");
        const organ = await RequestedOrgan.findById(organId)
            .populate('hospitalId', 'name address')
            .populate('doctorId', 'name email phoneNumber');
        
        if (!organ) {
            throw new Error("Requested organ not found");
        }
        
        console.log("Found organ:", organ);
        return organ;
    } catch (error) {
        console.error("Repository error finding organ by ID:", error);
        throw error;
    }
  }
}

module.exports = DonorRepository;