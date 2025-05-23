const User = require('../../models/user');
const sendEmail = require('../../utils/sendEmail');

// OTP Verification logic
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    console.log('trying to verifyOtp')

    try {
        let user = await User.findOne({ email });
        if (!user) {
            console.log({msg: 'user not found'})
            return res.status(400).json({ msg: 'User not found' });
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            console.log({msg: 'Invalid OTP'})
            return res.status(400).json({ msg: 'Invalid OTP' });
        }
        // Verify user
        user.isVerified = true;
        user.otp = undefined;
        await user.save();
        console.log({msg: 'User verified successfully'})
        res.status(200).json({ msg: 'User verified successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Resend OTP logic
exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Generate a new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save the new OTP to user
        user.otp = otp;
        await user.save();

        // Send OTP via email
        await sendEmail(user.email, 'Email Verification', `Your OTP is ${otp}`);
        console.log('OTP resent to:', user.email);

        res.status(200).json({ msg: 'OTP resent successfully' });

    } catch (err) {
        console.error('Error during resend OTP:', err.message);
        res.status(500).send('Server error');
    }
};
