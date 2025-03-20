const mongoose = require("mongoose");

// Define Schema
const TransferDataSchema = new mongoose.Schema({
  transfer: {
    type: String,
    required: true,
  },
  materials: [
    {
      category: { type: String, required: false },
      materialName: { type: String, required: true },
      quantity: { type: Number, required: true },
      unit: { type: String, required: true },
    },
  ],
  sendingSite: {
    type: String,
    required: true,
  },
  recievingSite: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  
});

// Create Model
const TransferData = mongoose.model("TransferData", TransferDataSchema);

module.exports = TransferData;
