const DonatedOrgan = require('../models/DonatedOrgan');
const Hospital = require('../models/Hospital');
const RequestedOrgan = require('../models/RequestedOrgan');
const User = require('../models/User');
const Allocation = require("../models/Allocation");

class DoctorRepository {

  async createRequest(data) {
    try {

      const doctor = await User.findById(data.doctorId);
      if (!doctor) throw new Error("Doctor not found");

      data.doctorName = doctor.name;
      data.address = doctor.address;
      data.location = doctor.location;
      data.hospitalId = doctor.hospitalId;
      data.phoneNumber = doctor.phoneNumber;

      const organ = await RequestedOrgan.create(data);

      if (doctor.hospitalId) {
        await Hospital.findByIdAndUpdate(
          doctor.hospitalId,
          { $push: { request: organ._id } }
        );
      }

      return organ;

    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllAvailable(data) {
    const organs = await DonatedOrgan.find({
      organName: data.organName,
      bloodGroup: data.bloodGroup,
      status: "AVAILABLE"
    });
    return organs;
  }

  async getDoctorRequests(doctorId) {
    return await RequestedOrgan.find({ doctorId })
      .sort({ createdAt: -1 });
  }

    async getHospitalRequests(doctorId) {

      const doctor = await User.findById(doctorId);
      if (!doctor) throw new Error("Doctor not found");

      return await RequestedOrgan.find({
        hospitalId: doctor.hospitalId
      }).sort({ createdAt: -1 });
    }

  async getDoctorAllocations(doctorId, statusFilter) {

  // 1. get all requests created by doctor
  const doctorRequests =
    await RequestedOrgan.find({ doctorId }).select("_id");

  const requestIds =
    doctorRequests.map(r => r._id);

  // if doctor has no requests
  if (!requestIds.length) return [];

  // 2. base query (ALWAYS applied)
  const query = {
    requestId: { $in: requestIds }
  };

  // 3. OPTIONAL FILTERING
  if (statusFilter) {

    if (statusFilter === "ALL_ACTIVE") {
      query.status = {
        $in: ["PENDING_CONFIRMATION", "MATCHED"]
      };
    }
    else if (statusFilter !== "ALL") {
      query.status = statusFilter;
    }

  }

  // 4. fetch allocations
  return await Allocation.find(query)
    .sort({ createdAt: -1 })
    .populate("organId", "organName bloodGroup status donorId")
    .populate("requestId", "organName urgencyScore status")
    .populate("hospitalId", "name");
}

  // ================================
  // NEW DASHBOARD COUNTS METHOD
  // ================================
  async getDoctorDashboardCounts(doctorId) {

    const doctorRequests =
      await RequestedOrgan.find({ doctorId })
        .select("_id");

    const requestIds =
      doctorRequests.map(r => r._id);

    const totalRequests = requestIds.length;

    const activeAllocations =
      await Allocation.countDocuments({
        requestId: { $in: requestIds },
        status: {
          $in: [
            "PENDING_CONFIRMATION",
            "MATCHED"
          ]
        }
      });

    const completedTransplants =
      await Allocation.countDocuments({
        requestId: { $in: requestIds },
        status: "COMPLETED"
      });

    const failedAllocations =
      await Allocation.countDocuments({
        requestId: { $in: requestIds },
        status: "FAILED"
      });

    return {
      totalRequests,
      activeAllocations,
      completedTransplants,
      failedAllocations
    };
  }
}

module.exports = DoctorRepository;
