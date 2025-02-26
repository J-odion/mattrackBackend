const mongoose = require("mongoose");

// Define Schema
const disbursedDataSchema = new mongoose.Schema({
  disbursed: {
    type: String,
    required: true,
  },
  materialCategory: {
    type: String,
    required: true,
  },
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
  siteLocation: {
    type: String,
    required: true,
  },
  recipientName: {
    type: String,
    default: "",
  },
  houseType: {
    type: String,
    default: "",
  },
  purpose: {
    type: String,
    default: "",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  assignedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

});

// Create Model
const DisbursedTable = mongoose.model("DisbursedTable", disbursedDataSchema);

module.exports = DisbursedTable;
