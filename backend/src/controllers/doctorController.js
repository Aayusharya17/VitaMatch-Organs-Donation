const DoctorService = require("../services/doctorService");
const doctorServ = new DoctorService();

const requestOrgan = async (req, res) => {
  try {
    if (!req.user || req.user.role === "DONOR") {
      return res.status(403).json({
        data: {},
        success: false,
        message: "Not Authenticated or Invalid Role",
        err: "Forbidden access"
      });
    }

    const doctorId = req.user.id;
    const { organName, bloodGroup, urgencyScore } = req.body;

    if (!organName || !bloodGroup) {
      return res.status(400).json({
        data: {},
        success: false,
        message: "organName and bloodGroup are required",
        err: "Missing required fields"
      });
    }

    const organ = await doctorServ.requestOrgan({
      organName,
      bloodGroup,
      urgencyScore,
      doctorId
    });

    return res.status(201).json({
      data: organ,
      success: true,
      message: "Organ requested successfully",
      err: {}
    });

  } catch (error) {
    console.error("Error requesting organ:", error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Failed to request organ",
      err: error.message
    });
  }
};

const findAllAvailable = async (req, res) => {
  try {
    const { organName, bloodGroup } = req.query;

    if (!organName || !bloodGroup) {
      return res.status(400).json({
        data: [],
        success: false,
        message: "organName and bloodGroup are required",
        err: "Missing required parameters"
      });
    }

    const doctorId = req.user.id;
    const availableOrgans = await doctorServ.findAllAvailable(
      {
        organName,
        bloodGroup,
        urgencyScore: 10
      },
      doctorId
    );

    return res.status(200).json({
      data: availableOrgans,
      success: true,
      message: "Available organs fetched successfully",
      err: {}
    });

  } catch (error) {
    console.error("Error finding available organs:", error);
    return res.status(500).json({
      data: [],
      success: false,
      message: "Failed to load available organs",
      err: error.message
    });
  }
};

const acceptOrgan = async (req, res) => {
  try {
    const { organId, requestId } = req.body;

    if (!organId) {
      return res.status(400).json({
        data: {},
        success: false,
        message: "organId is required",
        err: "Missing required field"
      });
    }

    const allocation = await doctorServ.acceptOrgan({
      organId,
      requestId,
      user: req.user
    });

    return res.status(201).json({
      data: allocation,
      success: true,
      message: "Organ accepted successfully",
      err: {}
    });

  } catch (error) {
    console.error("Error accepting organ:", error);
    return res.status(500).json({
      data: {},
      success: false,
      message: error.message || "Failed to accept organ",
      err: error.message
    });
  }
};

const doctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const data = await doctorServ.doctorDashboard(doctorId);

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data,
      err: {}
    });

  } catch (error) {
    console.error("Error fetching dashboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
      err: error.message
    });
  }
};

const getDoctorAllocations = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { status } = req.query;

    const data = await doctorServ.getDoctorAllocations(doctorId, status);

    return res.status(200).json({
      success: true,
      message: "Allocations fetched successfully",
      data,
      err: {}
    });

  } catch (error) {
    console.error("Error fetching allocations:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load allocations",
      err: error.message
    });
  }
};

const completeAllocation = async (req, res) => {
  try {
    const { allocationId } = req.body;

    if (!allocationId) {
      return res.status(400).json({
        success: false,
        message: "allocationId is required",
        err: "Missing required field"
      });
    }

    const result = await doctorServ.completeAllocation(
      allocationId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Allocation completed successfully",
      data: result,
      err: {}
    });

  } catch (error) {
    console.error("Error completing allocation:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to complete allocation",
      err: error.message
    });
  }
};

const failAllocation = async (req, res) => {
  try {
    const { allocationId, reason } = req.body;

    if (!allocationId) {
      return res.status(400).json({
        success: false,
        message: "allocationId is required",
        err: "Missing required field"
      });
    }

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Failure reason is required",
        err: "Missing failure reason"
      });
    }

    const result = await doctorServ.failAllocation(
      allocationId,
      reason.trim(),
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Allocation marked as failed",
      data: result,
      err: {}
    });

  } catch (error) {
    console.error("Error failing allocation:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update allocation",
      err: error.message
    });
  }
};

const viewRequest = async (req, res) => {
  try {
    const requestId = req.query.id;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required",
        err: "Missing request ID"
      });
    }

    const response = await doctorServ.viewRequest(requestId);

    return res.status(200).json({
      success: true,
      message: "Request details loaded successfully",
      data: response,
      err: {}
    });

  } catch (error) {
    console.error("Error viewing request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load request details",
      err: error.message
    });
  }
};

module.exports = {
  requestOrgan,
  findAllAvailable,
  acceptOrgan,
  doctorDashboard,
  getDoctorAllocations,
  failAllocation,
  completeAllocation,
  viewRequest
};