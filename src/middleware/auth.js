const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware to verify JWT and attach user to request
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];  
    if (!token) return res.status(401).json({ error: "Access Denied. No Token Provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    next();
} catch (error) {
    res.status(401).json({ error: "Invalid token", details: error.message });
}
};

// Middleware to check user role (admin, storekeeper, etc.)
exports.requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. ${role}s only.` });
    }
    next();
  };
};
