
const { default: mongoose } = require("mongoose");
const User = require("../../models/user");
const DisbursedTable = require("../../models/disbursed");
const Inventory = require("../../models/inventory");


exports.addDisbursedData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      disbursed = "disbursed",
      recipientName,
      purpose,
      materialName,
      quantity,
      unit,
      siteLocation,
      houseType,
      constructionNumber,
      assignedUsers,
      date
    } = req.body;

    // Check for missing fields
    const requiredFields = ["purpose", "materialName", "quantity", "unit", "siteLocation", "houseType", "constructionNumber", "date"];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
    }

    // Validate data types
    if (isNaN(quantity)) {
      return res.status(400).json({ error: "Quantity must be a number" });
    }

    if (isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Create and save new disbursed data
    const newDisbursedData = new DisbursedTable({
      disbursed,
      materialName,
      quantity: Number(quantity),
      unit,
      siteLocation,
      purpose,
      houseType,
      constructionNumber,
      recipientName,
      assignedUsers,
      date: new Date(date)
    });

    // Update inventory
    // let inventory = await Inventory.findOne({  materialName, siteLocation, unit }).session(session);

    const normalizedMaterialName = materialName.trim().toLowerCase();
    const normalizedSiteLocation = siteLocation.trim();
    const normalizedUnit = unit.trim();

    let inventory = await Inventory.findOne({
      materialName: { $regex: `^${normalizedMaterialName}$`, $options: "i" }, // Case-insensitive match
      siteLocation: normalizedSiteLocation,
      unit: normalizedUnit,
    }).session(session);

    console.log("Searching for:", {
      materialName: normalizedMaterialName,
      siteLocation: normalizedSiteLocation,
      unit: normalizedUnit
    });

    const checkMaterial = await Inventory.find({}); // Fetch all to manually inspect
    console.log("Existing materials:", checkMaterial);

    if (!inventory) {
      // If material doesn't exist, throw an error
      throw new Error("Material does not exist in inventory.");
    }
    if (inventory.totalQuantity < quantity) {
      // If insufficient stock, throw an error
      throw new Error(`Insufficient stock. Available stock: ${inventory.totalQuantity}`);
    }

    // Use the $inc operator to decrease the total quantity
    inventory.totalQuantity -= quantity;

    // Save both newDisbursedData and inventory
    await newDisbursedData.save({ session });
    await inventory.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newDisbursedData);
  } catch (err) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error(err);
    res.status(500).json({ error: "Failed to save disbursed data", details: err.message });
  }
};
exports.getAllDisbursedData = async (req, res) => {
  try {
    const data = await DisbursedTable.find().populate("assignedUsers", "name email");

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
};
// exports.getAllDisbursedData = async (req, res) => {
//   try {
//     const data = await DisbursedTable.find();
//     res.status(200).json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch data", details: err.message });
//   }
// };
// Filter data
exports.filterDisbursedData = async (req, res) => {
  const { site, houseType, purpose, material, subMaterial, date } = req.query;

  const filter = {};
  if (site) filter.site = site;
  if (houseType) filter.houseType = houseType;
  if (purpose) filter.purpose = purpose;
  if (material) filter.material = material;
  if (subMaterial) filter.subMaterial = subMaterial;
  if (date) filter.date = { $gte: new Date(date) };

  try {
    const filteredData = await DisbursedTable.find(filter);
    res.status(200).json(filteredData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to apply filter", details: err.message });
  }
};