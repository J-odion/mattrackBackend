const { default: mongoose } = require("mongoose");
const TransferData = require("../../models/transfer");
const Inventory = require("../../models/inventory");



exports.sendMaterials = async (req, res) => {
  const { fromSite, toSite, materials } = req.body;
  const createdBy = req.user.id; // Storekeeper initiating transfer

  try {
    // Check if inventory has enough stock
    for (const item of materials) {
      const inventoryItem = await Inventory.findOne({ site: fromSite, material: item.materialId });

      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for material ID: ${item.materialId}` });
      }
    }

    // Reduce stock from sending site
    for (const item of materials) {
      await Inventory.findOneAndUpdate(
        { site: fromSite, material: item.materialId },
        { $inc: { quantity: -item.quantity } },
        { new: true }
      );
    }

    // Create a new transfer record
    const transfer = new TransferData({
      fromSite,
      toSite,
      materials,
      createdBy,
      status: "pending",
    });

    await transfer.save();
    res.status(201).json({ message: "Transfer initiated successfully", transfer });
  } catch (error) {
    res.status(500).json({ error: "Transfer failed", details: error.message });
  }
};

exports.acceptTransfer = async (req, res) => {
  const { transferId } = req.params;
  const approvedBy = req.user.id; // Storekeeper approving

  try {
    const transfer = await TransferData.findById(transferId);
    if (!transfer || transfer.status !== "pending") {
      return res.status(400).json({ error: "Invalid transfer or already accepted" });
    }

    // Increase stock in receiving site
    for (const item of transfer.materials) {
      await Inventory.findOneAndUpdate(
        { site: transfer.toSite, material: item.materialId },
        { $inc: { quantity: item.quantity } },
        { upsert: true, new: true }
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