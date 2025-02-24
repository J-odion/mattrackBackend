const mongoose = require("mongoose");

// Define Schema
const tableDataSchema = new mongoose.Schema({
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
  houseType: {
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
const TableData = mongoose.model("TableData", tableDataSchema);

module.exports = TableData;
