const { default: mongoose } = require("mongoose");
const User = require("../../models/user");
const TableData = require("../../models/table");
const Inventory = require("../../models/inventory");

exports.addData = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const {
        received = "received", // Default value
        houseType,
        houseId,
        materials, // Expecting an array
        siteLocation,
        date,
        assignedUsers = [], // Default to empty array
      } = req.body;
  
      // Validate required fields
      const requiredFields = ["houseType", "houseId", "materials", "siteLocation", "date"];
      const missingFields = requiredFields.filter(field => !req.body[field]);
  
      if (missingFields.length > 0) {
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
      }
  
      // Validate materials array
      if (!Array.isArray(materials) || materials.length === 0) {
        return res.status(400).json({ error: "Materials must be a non-empty array" });
      }
  
      // Validate date format
      if (isNaN(new Date(date).getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
  
      // Check each material for required properties
      for (const material of materials) {
        if (!material.materialName || isNaN(material.quantity) || !material.unit) {
          return res.status(400).json({ error: "Each material must have materialName, quantity (number), and unit" });
        }
      }
  
      // Create new table data entry
      const newData = new TableData({
        received,
        houseType,
        houseId,
        materials,
        siteLocation,
        date: new Date(date),
        assignedUsers,
      });
  
      // Update Inventory for each material
      for (const material of materials) {
        const { materialName, quantity, unit } = material;
  
        const inventoryQuery = { materialName, siteLocation };
        let inventory = await Inventory.findOne(inventoryQuery).session(session);
  
        if (!inventory) {
          // Create new inventory entry
          inventory = new Inventory({
            materialName,
            totalQuantity: quantity,
            unit,
            siteLocation,
          });
        } else {
          // Update existing inventory
          inventory.totalQuantity += quantity;
        }
  
        await inventory.save({ session });
      }
  
      // Save table data
      await newData.save({ session });
  
      // Commit transaction
      await session.commitTransaction();
      session.endSession();
  
      res.status(201).json(newData);
    } catch (err) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
  
      console.error("Error saving data:", err);
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
  // // Filter data
  exports.filterData = async (req, res) => {
    const { siteLocation, houseType, purpose, material, subMaterial, date } = req.query;
  
    const filter = {};
    if (siteLocation) filter.siteLocation = siteLocation; // Fixed typo
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