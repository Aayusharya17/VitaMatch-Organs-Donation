const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const donorRoutes = require('./donorRoutes');
const doctorRoutes = require('./doctorRoutes');
const notificationRoutes = require('./notificationRoutes');
const allocationRoutes = require('./allocationRoutes');

router.use('/user',userRoutes);
router.use('/donor',donorRoutes);
router.use('/doctor',doctorRoutes);
router.use('/notification',notificationRoutes);
router.use('/allocation',allocationRoutes);

module.exports = router