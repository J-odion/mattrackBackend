const express = require("express");
const { signup } = require("../controllers/createStaff/createStaff");
const { login } = require("../controllers/createStaff/login");
const { verifyOtp, resendOtp } = require("../controllers/createStaff/otpVerification");
const { getAllStaff } = require("../controllers/createStaff/getAllStaff");
const { updateStaff } = require("../controllers/createStaff/editStaff");

const router = express.Router();

router.post("/register", signup);
router.post("/login", login);
router.post("/editstaff", updateStaff);
router.get("/allStaff", getAllStaff);


router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

module.exports = router;
