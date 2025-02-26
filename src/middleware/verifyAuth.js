const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
dotenv.config();

const secret = process.env.JWT_SECRET;

// Middleware function for verifying JWT
const verifyToken = async (req, res, next) => {
    
    
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ error: "Unauthorized: Token is missing" });
        }
    
        const token = authHeader.split(" ")[1];
    
        // Verify Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        // Fetch user from database
        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
    
        req.user = user; // Attach user to request object
        next();
      } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
      }
}

module.exports = verifyToken;
