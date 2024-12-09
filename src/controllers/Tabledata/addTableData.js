const Agents = require("../../models/TableData");


exports.addData = async (req, res) => {
  try {
    const newData = new TableData(req.body);
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (err) {
    res.status(500).json({ error: "Failed to save data", details: err.message });
  }
};
