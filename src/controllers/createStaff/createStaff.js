const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/sendEmail');

exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    
    console.log('Signup request body:', req.body);

    try {
        const normalizedEmail = email.toLowerCase().trim();
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            console.log('User already exists:', user);
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password securely
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user = new User({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            isVerified: false,
            role,
            otp,
            otpExpires
        });

        await user.save();
        console.log('User saved with OTP:', user);

        // Send OTP email
        try {
            await sendEmail(user.email, 'Email Verification', `Your OTP is ${otp}`);
            console.log('OTP email sent to:', user.email);
        } catch (emailErr) {
            console.error('Failed to send OTP email:', emailErr);
            return res.status(500).json({ msg: 'Failed to send OTP, try again' });
        }

        res.status(201).json({ user, msg: 'User registered, OTP sent to email' });

    } catch (err) {
        console.error('Error during signup:', err.message);
        res.status(500).send('Server error');
    }
};
