const express = require('express');
const router = express.Router();
const donorController = require('../../controllers/donorController');
const { authMiddleware } = require('../../middleware/auth');

router.post('/donateOrgan', authMiddleware, donorController.createDonation);
router.post('/confirmDonation', authMiddleware, donorController.confirmDonation);
router.get('/waitingOrgans', authMiddleware, donorController.findAllRequests);
router.post("/confirm-allocation/:id", authMiddleware, donorController.confirmAllocation);
router.post("/reject-allocation/:id", authMiddleware, donorController.rejectAllocation);
router.get('/all', authMiddleware, donorController.findAll);
router.post("/accept-organ", authMiddleware, donorController.acceptOrganById);

module.exports = router;