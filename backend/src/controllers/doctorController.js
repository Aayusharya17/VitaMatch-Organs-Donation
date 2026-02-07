const DoctorService = require("../services/doctorService");
const doctorServ = new DoctorService();

const requestOrgan = async (req, res) => {
  try {

    if (!req.user || req.user.role === "DONOR") {
      throw new Error("Not Authenticated");
    }

    const doctorId = req.user.id;

    const organ = await doctorServ.requestOrgan({
      organName: req.body.organName,
      bloodGroup: req.body.bloodGroup,
      urgencyScore: req.body.urgencyScore,
      doctorId
    });

    return res.status(201).json({
      data: organ,
      success: true,
      message: "Requested Successfully",
      err: {}
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Request failed",
      err: error.message
    });
  }
};

const findAllAvailable = async (req, res) => {
  try {
    if (!req.query.organName || !req.query.bloodGroup) {
    return res.status(400).json({
        success: false,
        message: "organName and bloodGroup are required"
    });
    }
    const doctorId = req.user.id;
    const availableOrgans =
      await doctorServ.findAllAvailable(
        {
          organName: req.query.organName,
          bloodGroup: req.query.bloodGroup,
          urgencyScore: 10
        },
        doctorId
      );

    return res.status(200).json({
      data: availableOrgans,
      success: true,
      message: "Fetched available organs",
      err: {}
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Could not load",
      err: error.message
    });
  }
};

const acceptOrgan = async (req, res) => {
  try {

    const { organId, requestId } = req.body;
    const allocation =
      await doctorServ.acceptOrgan({
        organId,
        requestId,
        user:req.user
      });

    return res.status(201).json({
      data: allocation,
      success: true,
      message: "Organ accepted successfully",
      err: {}
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      data: {},
      success: false,
      message: "Could not accept organ",
      err: error.message
    });
  }
};

const doctorDashboard = async (req, res) => {
  try {

    const doctorId = req.user.id;

    const data =
      await doctorServ.doctorDashboard(doctorId);

    return res.status(200).json({
      success: true,
      message: "Doctor dashboard data fetched",
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getDoctorAllocations = async (req, res) => {
  try {

    const doctorId = req.user.id;
    const { status } = req.query;

    const data =
      await doctorServ.getDoctorAllocations(doctorId, status);

    return res.status(200).json({
      success: true,
      message: "Doctor allocations fetched",
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const dispatchOrgan = async (req, res) => {
  try {
    const { allocationId } = req.body;

    const result =
      await doctorServ.dispatchOrgan(
        allocationId,
        req.user.id
      );

    res.json({
      success: true,
      message: "Organ dispatched",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const completeAllocation = async (req, res) => {
  try {
    const { allocationId } = req.body;

    const result =
      await doctorServ.completeAllocation(
        allocationId,
        req.user.id
      );

    res.json({
      success: true,
      message: "Allocation completed",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const failAllocation = async (req, res) => {
  try {
    const { allocationId, reason } = req.body;

    const result =
      await doctorServ.failAllocation(
        allocationId,
        reason,
        req.user.id
      );

    res.json({
      success: true,
      message: "Allocation failed",
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
  dispatchOrgan
};
