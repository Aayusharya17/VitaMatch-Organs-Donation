const express = require('express');
const router = express.Router();
const doctorController = require('../../controllers/doctorController');
const { authMiddleware } = require('../../middleware/auth');

router.post('/requestOrgan',authMiddleware,doctorController.requestOrgan);
router.get('/availableOrgans',authMiddleware,doctorController.findAllAvailable);
router.post('/accept-organ',authMiddleware,doctorController.acceptOrgan);
router.get('/dashboard',authMiddleware,doctorController.doctorDashboard);
router.get('/allocations',authMiddleware,doctorController.getDoctorAllocations);
router.post("/dispatch-organ",authMiddleware,doctorController.dispatchOrgan);
router.post("/complete-allocation",authMiddleware,doctorController.completeAllocation);
router.post("/fail-allocation",authMiddleware,doctorController.failAllocation);

module.exports = router;
