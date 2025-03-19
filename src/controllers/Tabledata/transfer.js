const { default: mongoose } = require("mongoose");
const TransferData = require("../../models/transfer");
const Inventory = require("../../models/inventory");

// Transfer materials from one site to another
exports.transferMaterials = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      materials,
      sendingSite,  // Source site
      recievingSite,    // Destination site
      date,
      user,
    } = req.body;

    // Validate required fields
    const requiredFields = ["materials", "sendingSite", "recievingSite", "date", "user"];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

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

    // Create a new transfer entry
    const newTransfer = new TransferData({
      transferred: true, // Indicates the materials have been transferred
      materials,
      sendingSite,
      recievingSite,
      date: new Date(date),
      user,
    });

    // Update Inventory for each material
    for (const material of materials) {
      const { materialName, category, quantity, unit } = material;

      // Deduct from source site
      const sourceInventory = await Inventory.findOne({ materialName, siteLocation: sendingSite }).session(session);

      if (!sourceInventory || sourceInventory.totalQuantity < quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          error: `Insufficient stock for ${materialName} at ${sendingSite}`,
        });
      }

      sourceInventory.totalQuantity -= quantity;
      await sourceInventory.save({ session });

      // Add to destination site
      let destinationInventory = await Inventory.findOne({ materialName, siteLocation: recievingSite }).session(session);

      if (!destinationInventory) {
        destinationInventory = new Inventory({
          category,
          materialName,
          totalQuantity: quantity,
          unit,
          siteLocation: recievingSite,
        });
      } else {
        destinationInventory.totalQuantity += quantity;
      }

      await destinationInventory.save({ session });
    }

    // Save transfer data
    await newTransfer.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newTransfer);
  } catch (err) {
    // Abort transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error("Error saving data:", err);
    res.status(500).json({ error: "Failed to save data", details: err.message });
  }
};

// Get all transferred data
exports.getAllTransfers = async (req, res) => {
  try {
    const transfers = await TransferData.find();
    res.status(200).json(transfers);
  } catch (err) {
    console.error("Error fetching transfer data:", err);
    res.status(500).json({ error: "Failed to fetch transfer data", details: err.message });
  }
};

// Filter transferred data
exports.filterTransfers = async (req, res) => {
  const { sendingSite, recievingSite, material, date, user } = req.query;

  const filter = {};
  if (sendingSite) filter.sendingSite = sendingSite;
  if (recievingSite) filter.recievingSite = recievingSite;
  if (material) filter["materials.materialName"] = material;
  if (user) filter.user = user;
  if (date) filter.date = { $gte: new Date(date) };

  try {
    const filteredTransfers = await TransferData.find(filter);
    res.status(200).json(filteredTransfers);
  } catch (err) {
    console.error("Error filtering transfer data:", err);
    res.status(500).json({ error: "Failed to apply filter", details: err.message });
  }
};
