const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Ensure this points to your User model

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Access Denied. No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password"); // Attach user without password

    if (!req.user) return res.status(401).json({ error: "User not found" });

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token", details: err.message });
  }
};

exports.requireStorekeeper = (req, res, next) => {
  if (!req.user || req.user.role !== "storekeepers") {
    return res.status(403).json({ error: "Access denied. Storekeepers only." });
  }
  next();
};
