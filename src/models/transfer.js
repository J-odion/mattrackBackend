const mongoose = require("mongoose");

// Define Schema
const TransferDataSchema = new mongoose.Schema({
  fromSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    required: true,
  },
  toSite: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    required: true,
  },
  materials: [
    {
      materialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Create Model
const TransferData = mongoose.model("TransferData", TransferDataSchema);

module.exports = TransferData;
