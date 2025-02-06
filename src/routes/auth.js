const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/createStaff/createStaff');
const { login } = require('../controllers/createStaff/login');
const { verifyOtp, resendOtp } = require('../controllers/createStaff/otpVerification');


// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);


module.exports = router;
