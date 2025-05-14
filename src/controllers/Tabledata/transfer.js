const TransferData = require("../../models/transfer");
const Inventory = require("../../models/inventory");



exports.sendMaterials = async (req, res) => {
  const { fromSite, toSite, materials, createdBy } = req.body;

  try {
    // Validate required fields
    if (!fromSite || !toSite || !Array.isArray(materials) || materials.length === 0 || !createdBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if inventory has enough stock for each material
    for (const item of materials) {
      if (!item.materialName || typeof item.quantity !== "number") {
        return res.status(400).json({ error: "Each material must include a valid name and quantity" });
      }

      const inventoryItem = await Inventory.findOne({
        siteLocation: fromSite,
        materialName: { $regex: `^${item.materialName.trim()}$`, $options: "i" },
      });

      if (!inventoryItem) {
        return res.status(400).json({ error: `Material '${item.materialName}' not found in ${fromSite}` });
      }

      if (inventoryItem.totalQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for '${item.materialName}' in ${fromSite}. Available: ${inventoryItem.totalQuantity}, Required: ${item.quantity}`,
        });
      }
    }

    // Deduct stock from sending site
    for (const item of materials) {
      await Inventory.findOneAndUpdate(
        {
          siteLocation: fromSite,
          materialName: { $regex: `^${item.materialName.trim()}$`, $options: "i" },
        },
        {
          $inc: { totalQuantity: -item.quantity },
        },
        { new: true }
      );
    }

    // Save transfer record
    const transfer = new TransferData({
      fromSite,
      toSite,
      materials: materials.map(item => ({
        materialName: item.materialName.trim(),
        unit: item.unit,
        quantity: item.quantity,
      })),
      createdBy,
      status: "pending",
    });

    await transfer.save();

    return res.status(201).json({
      message: "Transfer initiated successfully",
      transfer,
    });

  } catch (error) {
    console.error("Transfer error:", error);
    return res.status(500).json({ error: "Transfer failed", details: error.message });
  }
};

exports.acceptTransfer = async (req, res) => {
  const { transferId } = req.params;
  const { approvedBy } = req.body;

  try {
    if (!approvedBy) {
      return res.status(400).json({ error: "Missing required field: approvedBy" });
    }
    const transfer = await TransferData.findById(transferId);
    if (!transfer || transfer.status !== "pending") {
      return res.status(400).json({ error: "Invalid transfer or already accepted" });
    }

    // Increase stock in receiving site
    for (const item of transfer.materials) {
      await Inventory.findOneAndUpdate(
        {
          materialName: item.materialName.trim().toLowerCase(),
          siteLocation: transfer.toSite.trim().toLowerCase(),
        },
        {
          $inc: { totalQuantity: item.quantity },
          $setOnInsert: {
            unit: item.unit,
            materialName: item.materialName.trim(),
            siteLocation: transfer.toSite.trim(),
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    // Mark transfer as completed
    transfer.status = "completed";
    transfer.approvedBy = approvedBy;
    await transfer.save();
    res.status(200).json({ message: "Transfer accepted", transfer });
  } catch (error) {
    res.status(500).json({ error: "Failed to accept transfer", details: error.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const transfers = await TransferData.find()
      .populate("fromSite", "name")  // Show site name
      .populate("toSite", "name")
      .populate("createdBy", "name")  // Show who initiated
      .populate("approvedBy", "name"); // Show who approved (if completed)

    res.status(200).json(transfers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch transfers", details: error.message });
  }
};