const TableData = require("../../models/table");

// Add new table entry
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

exports.getAllData = async (req, res) => {
  try {
    const data = await TableData.find();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
};

// Filter data
exports.filterData = async (req, res) => {
  const { site, houseType, purpose, material, subMaterial, date } = req.query;

  const filter = {};
  if (site) filter.site = site;
  if (houseType) filter.houseType = houseType;
  if (purpose) filter.purpose = purpose;
  if (material) filter.material = material;
  if (subMaterial) filter.subMaterial = subMaterial;
  if (date) filter.date = { $gte: new Date(date) };

  try {
    const filteredData = await TableData.find(filter);
    res.status(200).json(filteredData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to apply filter", details: err.message });
  }
};
