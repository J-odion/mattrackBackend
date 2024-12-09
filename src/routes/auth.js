const express = require('express');
const router = express.Router();
const { signup } = require('../controllers/auth/signup');
const { login } = require('../controllers/auth/login');
const { requestPasswordReset, resetPassword } = require('../controllers/auth/controlPassword');
const { verifyOtp } = require('../controllers/auth/otpverification');
const { resendOtp } = require('../controllers/auth/resendotp');

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);


module.exports = router;
