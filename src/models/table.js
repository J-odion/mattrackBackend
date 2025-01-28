const mongoose = require("mongoose");

// Define Schema
const tableDataSchema = new mongoose.Schema({
  materialManagement: {
    type: String,
    default: "",
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
  siteLocation: {
    type: String,
    required: true,
  },
  unit: {
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
  houseNumber: {
    type: String,
    default: "",
  },
  purpose: {
    type: String,
    default: "",
  },
  storeKeepersName: {
    type: String,
    required: true,
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
const TableData = mongoose.model("TableData", tableDataSchema);

module.exports = TableData;
