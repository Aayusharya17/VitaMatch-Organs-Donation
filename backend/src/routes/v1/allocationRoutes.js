const express = require("express");
const router = express.Router();
const allocationController = require("../../controllers/allocationController");

router.get("/verify/:id",allocationController.verifyAllocation);

module.exports = router;