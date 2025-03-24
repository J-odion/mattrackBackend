const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "viewer", "storekeepers", "engineers", "projectManager", "projectEngineer"],
    default: "viewer",
  },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
