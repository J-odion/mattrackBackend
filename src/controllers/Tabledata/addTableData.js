const Agents = require("../../models/TableData");

exports.addData = async (req, res) => {
  try {
    const { site, houseType, purpose, material, subMaterial, date } = req.body;
    if (!site || !houseType || !purpose || !material || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newData = new TableData({ site, houseType, purpose, material, subMaterial, date });
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save data", details: err.message });
  }
};
