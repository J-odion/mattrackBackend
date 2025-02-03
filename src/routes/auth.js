const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/createStaff/createStaff');
const { login } = require('../controllers/createStaff/login');
const { verifyOtp } = require('../controllers/createStaff/otpVerification');
const { resendOtp } = require('../controllers/auth/resendotp');

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);


module.exports = router;
