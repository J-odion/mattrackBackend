
const mongoose = require("mongoose");

const requestMaterialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    purpose: { type: String, required: true }, // Building phase
    siteLocation: { type: String, required: true },
    houseType: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    materials: [
      {
        materialName: { type: String, required: true },
        quantity: { type: Number, required: true },
        rate: { type: Number }, // To be added later by admin
        amount: { type: Number }, // To be calculated later by admin
      },
    ],
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: { type: String }, // Optional rejection reason by project manager
  });
  
  const RequestMaterial = mongoose.model("RequestMaterial", requestMaterialSchema);
  
  module.exports = RequestMaterial;
