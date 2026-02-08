const express = require('express');
const router = express.Router();
const donorController = require('../../controllers/donorController');
const {authMiddleware} = require('../../middleware/auth');

router.post('/donateOrgan',authMiddleware,donorController.createDonation); // working fine
router.post('/confirmDonation',authMiddleware,donorController.confirmDonation); // working fine
router.get('/waitingOrgans',authMiddleware,donorController.findAllRequests); // working fine
router.post("/confirm-allocation/:id", authMiddleware, donorController.confirmAllocation); // working fine
router.post("/reject-allocation/:id", authMiddleware, donorController.rejectAllocation);
router.get('/all', authMiddleware, donorController.findAll);
router.post("/accept-organ", authMiddleware, donorController.acceptOrganById);

module.exports = router;