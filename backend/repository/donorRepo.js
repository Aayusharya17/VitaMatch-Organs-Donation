const DonatedOrgan = require("../models/DonatedOrgan");
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
}

module.exports = DonorRepository;