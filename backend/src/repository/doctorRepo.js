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

      if (doctor.role !== "DOCTOR") {
        throw new Error("Only doctors can create organ requests");
      }

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
      console.error("Repository error creating request:", error);
      throw error;
    }
  }

  async findAllAvailable(data) {
    try {
      const query = {
        status: "AVAILABLE"
      };

      if (data.organName) {
        query.organName = data.organName;
      }

      if (data.bloodGroup) {
        query.bloodGroup = data.bloodGroup;
      }

      // FIXED: Changed from 'DONOR' model to 'User' model reference
      const organs = await DonatedOrgan.find(query)
        .populate('donorId', 'name phoneNumber email role')
        .populate('hospitalId', 'name address phoneNumber')
        .sort({ createdAt: -1 });

      return organs;
    } catch (error) {
      console.error("Repository error finding available organs:", error);
      throw error;
    }
  }

  async getDoctorRequests(doctorId) {
    try {
      return await RequestedOrgan.find({ doctorId })
        .populate('hospitalId', 'name address')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("Repository error getting doctor requests:", error);
      throw error;
    }
  }

  async getHospitalRequests(doctorId) {
    try {
      const doctor = await User.findById(doctorId);
      if (!doctor) throw new Error("Doctor not found");

      if (!doctor.hospitalId) {
        return [];
      }

      return await RequestedOrgan.find({
        hospitalId: doctor.hospitalId
      })
        .populate('doctorId', 'name phoneNumber')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("Repository error getting hospital requests:", error);
      throw error;
    }
  }

async getDoctorAllocations(doctorId, statusFilter) {
  try {
    // Get doctor's hospital
    const doctor = await User.findById(doctorId).select("hospitalId");
    if (!doctor || !doctor.hospitalId) {
      return [];
    }

    // Base query: all allocations for this hospital
    const query = {
      hospitalId: doctor.hospitalId
    };

    // Optional status filtering
    if (statusFilter) {
      if (statusFilter === "ALL_ACTIVE") {
        query.status = {
          $in: ["PENDING_CONFIRMATION", "MATCHED"]
        };
      } else if (statusFilter !== "ALL") {
        query.status = statusFilter;
      }
    }

    // Fetch allocations for the hospital
    return await Allocation.find(query)
      .sort({ createdAt: -1 })
      .populate("organId", "organName bloodGroup status donorId")
      .populate({
        path: "requestId",
        select: "organName bloodGroup urgencyScore status doctorId",
        populate: {
          path: "doctorId",
          select: "name email phoneNumber"
        }
      })
      .populate("hospitalId", "name address phoneNumber");
      
  } catch (error) {
    console.error("Repository error getting allocations:", error);
    throw error;
  }
}

  async viewRequest(requestId) {
    try {
      const response = await RequestedOrgan.findById(requestId)
        .populate('doctorId', 'name phoneNumber email')
        .populate('hospitalId', 'name address phoneNumber');

      if (!response) {
        throw new Error("Request not found");
      }

      return response;
    } catch (error) {
      console.error("Repository error viewing request:", error);
      throw error;
    }
  }

  async getDoctorDashboardCounts(doctorId) {
    try {
      const doctorRequests = await RequestedOrgan.find({ doctorId }).select("_id");
      const requestIds = doctorRequests.map(r => r._id);

      const totalRequests = requestIds.length;

      const activeAllocations = await Allocation.countDocuments({
        requestId: { $in: requestIds },
        status: {
          $in: ["PENDING_CONFIRMATION", "MATCHED"]
        }
      });

      const completedTransplants = await Allocation.countDocuments({
        requestId: { $in: requestIds },
        status: "COMPLETED"
      });

      const failedAllocations = await Allocation.countDocuments({
        requestId: { $in: requestIds },
        status: "FAILED"
      });

      return {
        totalRequests,
        activeAllocations,
        completedTransplants,
        failedAllocations
      };
    } catch (error) {
      console.error("Repository error getting dashboard counts:", error);
      throw error;
    }
  }
}

module.exports = DoctorRepository;