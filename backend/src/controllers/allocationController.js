const AllocationVerificationService =
  require("../services/allocationVerificationService");

const verificationService =
  new AllocationVerificationService();

const verifyAllocation = async (req, res) => {
  try {

    const result =
      await verificationService.verifyAllocation(
        req.params.id
      );

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { verifyAllocation };
