const mongoose = require("mongoose");

// Define Schema
const tableDataSchema = new mongoose.Schema({
  received: {
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
  siteLocation: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  
});

// Create Model
const TableData = mongoose.model("TableData", tableDataSchema);

module.exports = TableData;
