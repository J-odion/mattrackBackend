const mongoose = require("mongoose");

const TransferDataSchema = new mongoose.Schema({
  fromSite: {
    type: String,
    required: true,
  },
  toSite: {
    type: String,
    required: true,
  },
  materials: [
    {
      materialName: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      },
    },
  ],
  createdBy: {
    type: String,
    required: true,
  },
  approvedBy: {
    type: String,
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

const TransferData = mongoose.model("TransferData", TransferDataSchema);

module.exports = TransferData;
