// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {authMiddleware} = require('../../middleware/auth');
const notificationController = require('../../controllers/notificationController');

router.get("/my-notifications", authMiddleware, notificationController.getMyNotifications); //working fine

module.exports = router;
