const TableData = require("../../models/table");

exports.addData = async (req, res) => {
  try {
    const {
      materialManagement = "",
      materialCategory,
      materialName,
      quantity,
      siteLocation,
      unit,
      recipientName = "",
      houseType = "",
      houseNumber = "",
      purpose = "",
      storeKeepersName,
      date = new Date(),
    } = req.body;

    // Validate required fields
    if (
      !materialCategory ||
      !materialName ||
      !quantity ||
      !siteLocation ||
      !unit ||
      !storeKeepersName
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new document with the validated data
    const newData = new TableData({
      materialManagement,
      materialCategory,
      materialName,
      quantity,
      siteLocation,
      unit,
      recipientName,
      houseType,
      houseNumber,
      purpose,
      storeKeepersName,
      date,
    });

    // Save the document to the database
    const savedData = await newData.save();

    // Send success response
    res.status(201).json(savedData);
    console.log("Data saved successfully", savedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save data", details: err.message });
  }
};
