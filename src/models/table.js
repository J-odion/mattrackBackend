const mongoose = require("mongoose");

// Define Schema
const tableDataSchema = new mongoose.Schema({
  site: String,
  houseType: String,
  purpose: String,
  material: String,
  subMaterial: String,
  date: Date,
});

// Create Model
const TableData = mongoose.model("TableData", tableDataSchema);

module.exports = TableData;
