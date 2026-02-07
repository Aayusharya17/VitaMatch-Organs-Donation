const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');

router.post('/signup',userController.signup); //working fine
router.post('/login',userController.login); //working fine

module.exports = router;