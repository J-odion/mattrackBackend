const StandardAllocation = require("../models/standardAllocation");

exports.createStandardAllocation = async (req, res) => {
  try {
    const { purpose, materials, siteLocation, houseType, createdBy } = req.body;

    // Check if an allocation with the same purpose and siteLocation exists
    const existingAllocation = await StandardAllocation.findOne({ purpose, siteLocation, houseType });
    if (existingAllocation) {
      return res.status(400).json({ error: "Standard Allocation already exists for this location" });
    }

    const newAllocation = new StandardAllocation({
      purpose,
      materials,
      siteLocation,
      houseType,
      createdBy,
      updatedBy: createdBy || "system",
    });

    await newAllocation.save();
    res.status(201).json({ message: "Standard Allocation created successfully", data: newAllocation });
  } catch (error) {
    res.status(500).json({ error: "Failed to create Standard Allocation", details: error.message });
  }
};

exports.updateStandardAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { purpose, materials } = req.body;
    const allocation = await StandardAllocation.findById(id);
    
    if (!allocation) return res.status(404).json({ error: "Standard Allocation not found" });

    allocation.purpose = purpose;
    allocation.materials = materials;
    
    await allocation.save();
    res.json({ message: "Standard Allocation updated successfully", data: allocation });
  } catch (error) {
    res.status(500).json({ error: "Failed to update Standard Allocation", details: error.message });
  }
};

exports.getAllStandardAllocations = async (req, res) => {
  try {
    const allocations = await StandardAllocation.find();
    res.json({ count: allocations.length, data: allocations });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Standard Allocations", details: error.message });
  }
};

exports.getStandardAllocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const allocation = await StandardAllocation.findById(id);
    
    if (!allocation) return res.status(404).json({ error: "Standard Allocation not found" });

    res.json(allocation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Standard Allocation", details: error.message });
  }
};

exports.deleteStandardAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const allocation = await StandardAllocation.findByIdAndDelete(id);

    if (!allocation) return res.status(404).json({ error: "Standard Allocation not found" });

    res.json({ message: "Standard Allocation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Standard Allocation", details: error.message });
  }
};

exports.getSiteStandardAllocations = async (req, res) => {
  try {
    const { siteLocation, houseType, purpose } = req.query;

    // Build filter object dynamically
    let filter = {};
    if (siteLocation) filter.siteLocation = siteLocation;
    if (houseType) filter.houseType = houseType;
    if (purpose) filter.purpose = purpose;

    const allocations = await StandardAllocation.find(filter);

    res.json({ count: allocations.length, data: allocations });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Standard Allocations", details: error.message });
  }
};