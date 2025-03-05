const { default: mongoose } = require("mongoose");
const DisbursedTable = require("../../models/disbursed");
const Inventory = require("../../models/inventory");
const TableData = require("../../models/table");
const User = require("../../models/user");
const StandardAllocation = require("../../models/standardAllocation");
const RequestMaterial = require("../../models/requestMat");


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
exports.addDisbursedData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      disbursed = "disbursed",
      recipientName,
      purpose,
      materialCategory,
      materialName,
      quantity,
      unit,
      siteLocation,
      houseType,
      date
    } = req.body;

    // Check for missing fields
    const requiredFields = ["purpose", "recipientName", "materialCategory", "materialName", "quantity", "unit", "siteLocation", "houseType", "date"];
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
      materialCategory,
      materialName,
      quantity: Number(quantity),
      unit,
      siteLocation,
      purpose,
      houseType,
      recipientName,
      date: new Date(date)
    });

    // Update inventory
    let inventory = await Inventory.findOne({ materialCategory, materialName, siteLocation, unit }).session(session);
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
    const data = await DisbursedTable.find();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
};
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
exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.status(200).json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory", details: err.message });
  }
};
// Filter data
// exports.filterInventoryData = async (req, res) => {
//   const { siteLocation, houseType, purpose, material, subMaterial, date } = req.query;

//   const filter = {};
//   if (siteLocation) filter.siteLocation = siteLocation; // Fixed typo
//   if (houseType) filter.houseType = houseType;
//   if (purpose) filter.purpose = purpose;
//   if (material) filter.material = material;
//   if (subMaterial) filter.subMaterial = subMaterial;
//   if (date) filter.date = { $gte: new Date(date) };

//   try {
//     const filteredData = await Inventory.find(filter);
//     res.status(200).json(filteredData);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to apply filter", details: err.message });
//   }
// };
exports.filterInventoryData = async (req, res) => {
  try {
    const { siteLocation, houseType, purpose, material, subMaterial, date, startDate, endDate } = req.query;

    const filter = {};

    if (siteLocation) filter.siteLocation = siteLocation;
    if (houseType) filter.houseType = houseType;
    if (purpose) filter.purpose = purpose;
    if (material) filter.material = material;
    if (subMaterial) filter.subMaterial = subMaterial;

    // Handle date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    } else if (date) {
      filter.date = { $gte: new Date(date) }; // Fallback for a single date
    }

      // Pagination handling
    const limit = parseInt(req.query.limit) || 20; // Default limit
    const page = parseInt(req.query.page) || 1; // Default to first page
    const skip = (page - 1) * limit;

    // Fetch filtered data
    const filteredData = await Inventory.find(filter).skip(skip).limit(limit);

    // Count total records for pagination
    const totalRecords = await Inventory.countDocuments(filter);

    res.status(200).json({
      data: filteredData,
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
    });

  } catch (err) {
    console.error("Error filtering inventory:", err);
    res.status(500).json({ error: "Failed to apply filter", details: err.message });
  }
};
exports.requestMaterial = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, purpose, siteLocation, date, materials, houseType } = req.body;

    const materialEntries = materials.map(material => ({
      materialName: material.materialName,
      quantity: Number(material.quantity),
    }));

    const newRequest = new RequestMaterial({
      name,
      purpose,
      siteLocation,
      date: date ? new Date(date) : Date.now(),
      materials: materialEntries,
      houseType,
      status: "pending",
    });

    await newRequest.save({ session });

    console.log("New Request Saved:", newRequest);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newRequest);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in requestMaterial:", err); // Log full error for debugging
    res.status(500).json({ error: "Failed to save material request", details: err.message });
  }
};
exports.updateMaterialPricing = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { materials } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update material pricing" });
    }

    const request = await RequestMaterial.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Material request not found" });
    }

    request.materials.forEach(material => {
      const update = materials.find(m => m.materialName === material.materialName);
      if (update) {
        material.rate = update.rate;
        material.amount = update.rate * material.quantity;
      }
    });

    await request.save();
    res.status(200).json({ message: "Material pricing updated successfully", request });
  } catch (err) {
    res.status(500).json({ error: "Failed to update pricing", details: err.message });
  }
};
// Accept material request
exports.acceptMaterialRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await RequestMaterial.findByIdAndUpdate(requestId, { status: "approved" }, { new: true });

    if (!request) {
      return res.status(404).json({ error: "Material request not found" });
    }

    res.status(200).json({ message: "Material request approved", request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve material request", details: err.message });
  }
};
exports.reviewMaterialRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, comment } = req.body;

    const request = await RequestMaterial.findByIdAndUpdate(
      requestId,
      { status, comments: comment || "" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Material request not found" });
    }

    res.status(200).json({ message: `Material request ${status}`, request });
  } catch (err) {
    res.status(500).json({ error: "Failed to review material request", details: err.message });
  }
};
// Fetch all material requests with optional filtering by status
exports.getMaterialRequest = async (req, res) => {

  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requestMat = await RequestMaterial.find(filter).sort({ date: -1 });
    res.status(200).json(requestMat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch material requests", details: err.message });
  }
};