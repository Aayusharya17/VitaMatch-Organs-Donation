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
        console.log(error);
        throw new Error("Problem creating donation");
    }
  }

  async confirmDonation(donatedOrganId, donorId, consentType) {
    try {
      console.log("Donatedorganid : ",donatedOrganId,"\n")
      const organ = await DonatedOrgan.findById(donatedOrganId);

      if (!organ) throw new Error("Organ not found");

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
      console.log(error);
      throw error;
    }
  }

  async findAllRequests(data){
    try {
        const organName = data.organName;
        const bloodGroup = data.bloodGroup;
        const requests = await RequestedOrgan.find({organName,bloodGroup,status:"WAITING"});
        return requests
    } catch (error) {
        console.log(error);
        throw error;
    }
  }

  async findAll(donorId){
    try {
        const all = await DonatedOrgan.find({donorId});
        return all;
    } catch (error) {
        console.log(error);
        throw error;
    }
  }

}

module.exports = DonorRepository;
