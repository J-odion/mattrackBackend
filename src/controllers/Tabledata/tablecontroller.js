const { default: mongoose } = require("mongoose");
const DisbursedTable = require("../../models/disbursed");
const Inventory = require("../../models/inventory");
const User = require("../../models/user");
const StandardAllocation = require("../../models/standardAllocation");
const RequestMaterial = require("../../models/requestMat");



exports.getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.status(200).json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch inventory", details: err.message });
  }
};
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
    const { name, purpose, siteLocation, constructionNo, date, materials, houseType } = req.body;

    const materialEntries = materials.map(material => ({
      materialName: material.materialName,
      quantity: Number(material.quantity),
      unit: material.unit
    }));

    const newRequest = new RequestMaterial({
      name,
      purpose,
      siteLocation,
      date: date ? new Date(date) : Date.now(),
      materials: materialEntries,
      houseType,
      constructionNo,
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