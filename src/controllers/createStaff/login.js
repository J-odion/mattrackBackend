const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Log the incoming request body
  console.log("Login request body:", req.body);

  try {
    let user = await User.findOne({ email }).select("+password");

    // Log the retrieved user
    console.log("User retrieved:", user);

    if (!user) {
      return res.status(400).json({ msg: "Invalid Email address - User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Invalid credentials - User has not verified OTP" });
    }

    // Ensure password is hashed before comparison
    if (!user.password.startsWith("$2a$")) {
      return res.status(500).json({ msg: "Server error - User password not hashed" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials - Incorrect password" });
    }

    // Log successful password match
    console.log("Password match:", isMatch);

    const payload = {
      user: {
        id: user.id,
        role: user.role,
        email: user.email, // Include email
        name: user.name,   // Include name
        isVerified: user.isVerified,
      },
    };
    // Generate JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err.message);
          return res.status(500).json({ msg: "Server error - Token generation failed" });
        }
        res.json({ token, payload });
      }
    );
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send("Server error");
  }
};
