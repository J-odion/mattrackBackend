const mongoose = require("mongoose");

// Define Schema
const tableDataSchema = new mongoose.Schema({
  site: { type: String, required: true },
  houseType: { type: String, required: true },
  purpose: { type: String, required: true },
  material: { type: String, required: true },
  subMaterial: { type: String, default: null },
  date: { type: Date, required: true },
});

// Create Model
const TableData = mongoose.model("TableData", tableDataSchema);

module.exports = TableData;
