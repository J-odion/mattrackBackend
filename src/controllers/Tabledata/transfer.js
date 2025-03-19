const { default: mongoose } = require("mongoose");
const TransferData = require("../../models/transfer");
const Inventory = require("../../models/inventory");

// Transfer materials from one site to another
// exports.transferMaterials = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       materials,
//       sendingSite,  // Source site
//       recievingSite,    // Destination site
//       date,
//       user,
//     } = req.body;

//     // Validate required fields
//     const requiredFields = ["materials", "sendingSite", "recievingSite", "date", "user"];
//     const missingFields = requiredFields.filter((field) => !req.body[field]);

//     if (missingFields.length > 0) {
//       return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
//     }

//     // Validate materials array
//     if (!Array.isArray(materials) || materials.length === 0) {
//       return res.status(400).json({ error: "Materials must be a non-empty array" });
//     }

//     // Validate date format
//     if (isNaN(new Date(date).getTime())) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }

//     // Check each material for required properties
//     for (const material of materials) {
//       if (!material.materialName || isNaN(material.quantity) || !material.unit) {
//         return res.status(400).json({ error: "Each material must have materialName, quantity (number), and unit" });
//       }
//     }

//     // Create a new transfer entry
//     const newTransfer = new TransferData({
//       transferred: true, // Indicates the materials have been transferred
//       materials,
//       sendingSite,
//       recievingSite,
//       date: new Date(date),
//       user,
//     });

//     // Update Inventory for each material
//     for (const material of materials) {
//       const { materialName, category, quantity, unit } = material;

//       // Deduct from source site
//       const sourceInventory = await Inventory.findOne({ materialName, siteLocation: sendingSite }).session(session);

//       if (!sourceInventory || sourceInventory.totalQuantity < quantity) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({
//           error: `Insufficient stock for ${materialName} at ${sendingSite}`,
//         });
//       }

//       sourceInventory.totalQuantity -= quantity;
//       await sourceInventory.save({ session });

//       // Add to destination site
//       let destinationInventory = await Inventory.findOne({ materialName, siteLocation: recievingSite }).session(session);

//       if (!destinationInventory) {
//         destinationInventory = new Inventory({
//           category,
//           materialName,
//           totalQuantity: quantity,
//           unit,
//           siteLocation: recievingSite,
//         });
//       } else {
//         destinationInventory.totalQuantity += quantity;
//       }

//       await destinationInventory.save({ session });
//     }

//     // Save transfer data
//     await newTransfer.save({ session });

//     // Commit transaction
//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json(newTransfer);
//   } catch (err) {
//     // Abort transaction on error
//     await session.abortTransaction();
//     session.endSession();

//     console.error("Error saving data:", err);
//     res.status(500).json({ error: "Failed to save data", details: err.message });
//   }
// };



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



