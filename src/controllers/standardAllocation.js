const StandardAllocation = require("../models/standardAllocation");

exports.createStandardAllocation = async (req, res) => {
  try {
    const { purpose, materials, siteLocation, houseType, createdBy } = req.body;

    const newAllocation = new StandardAllocation({
      purpose,
      materials,
      siteLocation,
      houseType,
      createdBy,  // Ensure createdBy is passed
      updatedBy: createdBy || "system", // Set updatedBy to createdBy or a default value
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
