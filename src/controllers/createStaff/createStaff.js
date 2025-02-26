const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/sendEmail');

exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    
    console.log('Signup request body:', req.body);

    try {
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists:', user);
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            name,
            email,
            password: hashedPassword, // Save the hashed password
            isVerified: false, // Initial state
            role
        });

        // Generate 6-digit OTP and save to user record
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        await user.save();
        console.log('User saved with OTP:', user);

        // Send OTP email
        await sendEmail(user.email, 'Email Verification', `Your OTP is ${otp}`);
        console.log('OTP email sent to:', user.email);

        res.status(201).json({user, msg: 'User registered, OTP sent to email' });
    } catch (err) {
        console.error('Error during signup:', err.message);
        res.status(500).send('Server error');
    }
};
