const { default: mongoose } = require("mongoose");
const DisbursedTable = require("../../models/disbursed");
const Inventory = require("../../models/inventory");
const TableData = require("../../models/table");

// manage disbursed data
// exports.addData = async (req, res) => {
//   try {
//     const { 
//       materialCategory, 
//       materialName, 
//       quantity, 
//       unit, 
//       siteLocation, 
//       houseType, 
//       date 
//     } = req.body;

//     // Check for missing fields
//     const requiredFields = ["materialCategory", "materialName", "quantity", "unit", "siteLocation", "houseType", "date"];
//     const missingFields = requiredFields.filter(field => !req.body[field]);

//     if (missingFields.length > 0) {
//       return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
//     }

//     // Validate data types
//     if (isNaN(quantity)) {
//       return res.status(400).json({ error: "Quantity must be a number" });
//     }

//     if (isNaN(new Date(date).getTime())) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }

//     // Create and save new data
//     const newData = new TableData({ 
//       materialCategory, 
//       materialName, 
//       quantity: Number(quantity), // Ensure quantity is a number
//       unit, 
//       siteLocation, 
//       houseType, 
//       date: new Date(date) // Ensure date is a valid Date object
//     });

//     const savedData = await newData.save();
//     res.status(201).json(savedData);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to save data", details: err.message });
//   }
// };


// exports.addData = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { 
//       received = "received", // Default value for received
//       materialCategory, 
//       materialName, 
//       quantity, 
//       unit, 
//       siteLocation, 
//       houseType, 
//       date 
//     } = req.body;

//     // Check for missing fields
//     const requiredFields = ["materialCategory", "materialName", "quantity", "unit", "siteLocation", "houseType", "date"];
//     const missingFields = requiredFields.filter(field => !req.body[field]);

//     if (missingFields.length > 0) {
//       return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
//     }

//     // Validate data types
//     if (isNaN(quantity)) {
//       return res.status(400).json({ error: "Quantity must be a number" });
//     }

//     if (isNaN(new Date(date).getTime())) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }

//     // Create and save new data
//     const newData = new TableData({
//       received,
//       materialCategory, 
//       materialName, 
//       quantity: Number(quantity), 
//       unit, 
//       siteLocation, 
//       houseType, 
//       date: new Date(date) 
//     });

//     // Update inventory
//     const inventoryQuery = { materialName, materialCategory, siteLocation }; // Ensure uniqueness
//     let inventory = await Inventory.findOne(inventoryQuery).session(session);

//     if (!inventory) {
//       // If material doesn't exist in inventory, create a new entry
//       inventory = new Inventory({
//         materialName,
//         materialCategory,
//         totalQuantity: quantity,
//         unit,
//         siteLocation,
//       });
//     } else {
//       // If material exists, increase the total quantity
//       inventory.totalQuantity += quantity;
//     }

//     // Save both newData and inventory
//     await newData.save({ session });
//     await inventory.save({ session });

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json(newData);
//   } catch (err) {
//     // Abort the transaction on error
//     await session.abortTransaction();
//     session.endSession();

//     console.error(err);
//     res.status(500).json({ error: "Failed to save data", details: err.message });
//   }
// };

exports.addData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      received = "received", // Default value for received
      materialCategory, 
      materialName, 
      quantity, 
      unit, 
      siteLocation, 
      houseType, 
      date 
    } = req.body;

    // Check for missing fields
    const requiredFields = ["materialCategory", "materialName", "quantity", "unit", "siteLocation", "houseType", "date"];
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

    // Create and save new data
    const newData = new TableData({
      received,
      materialCategory, 
      materialName, 
      quantity: Number(quantity), 
      unit, 
      siteLocation, 
      houseType, 
      date: new Date(date) 
    });

    // Update inventory
    const inventoryQuery = { materialName, materialCategory, siteLocation }; // Ensure uniqueness
    let inventory = await Inventory.findOne(inventoryQuery).session(session);

    if (!inventory) {
      // If material doesn't exist in inventory, create a new entry
      inventory = new Inventory({
        materialName,
        materialCategory,
        totalQuantity: quantity,
        unit,
        siteLocation,
      });
    } else {
      // If material exists, increase the total quantity using $inc operator
      inventory.totalQuantity += quantity;
    }

    // Save both newData and inventory
    await newData.save({ session });
    await inventory.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newData);
  } catch (err) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error(err);
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
  if (siteLocation) filter.sisiteLocationte = siteLocation;
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


// manage recieved data
// exports.addDisbursedData = async (req, res) => {
//   try {
//     const { 
//       recipientName, 
//       houseNumber, 
//       purpose ,
//       materialCategory, 
//       materialName, 
//       quantity, 
//       unit, 
//       siteLocation, 
//       houseType, 
//       date 
//     } = req.body;

//     // Check for missing fields
//     const requiredFields = [ "purpose","houseNumber","recipientName" ,"site","materialCategory", "materialName", "quantity", "unit", "siteLocation", "houseType", "date"];
//     const missingFields = requiredFields.filter(field => !req.body[field]);

//     if (missingFields.length > 0) {
//       return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
//     }

//     // Validate data types
//     if (isNaN(quantity)) {
//       return res.status(400).json({ error: "Quantity must be a number" });
//     }

//     if (isNaN(new Date(date).getTime())) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }

//     // Create and save new data
//     const newData = new TableData({ 
//       materialCategory, 
//       materialName, 
//       quantity: Number(quantity), 
//       unit: Number(unit), 
//       siteLocation,
//       purpose,
//       houseType,
//       houseNumber,
//       recipientName,
//       date: new Date(date)
//     });

//     const savedData = await newData.save();
//     res.status(201).json(savedData);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to save data", details: err.message });
//   }
// };

// exports.addDisbursedData = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       disbursed = "disbursed",
//       recipientName, 
//       houseNumber, 
//       purpose,
//       materialCategory, 
//       materialName, 
//       quantity, 
//       unit, 
//       siteLocation, 
//       houseType, 
//       date 
//     } = req.body;

//     // Check for missing fields
//     const requiredFields = ["purpose", "houseNumber", "recipientName", "materialCategory", "materialName", "quantity", "unit", "siteLocation", "houseType", "date"];
//     const missingFields = requiredFields.filter(field => !req.body[field]);

//     if (missingFields.length > 0) {
//       return res.status(400).json({ error: `Missing required fields: ${missingFields.join(", ")}` });
//     }

//     // Validate data types
//     if (isNaN(quantity)) {
//       return res.status(400).json({ error: "Quantity must be a number" });
//     }

//     if (isNaN(new Date(date).getTime())) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }

//     // Create and save new disbursed data
//     const newDisbursedData = new DisbursedTable({ 
//       disbursed,
//       materialCategory, 
//       materialName, 
//       quantity: Number(quantity), 
//       unit, 
//       siteLocation,
//       purpose,
//       houseType,
//       houseNumber,
//       recipientName,
//       date: new Date(date)
//     });

//     // Update inventory
//     let inventory = await Inventory.findOne({ materialCategory, materialName, siteLocation, unit }).session(session);
//     if (!inventory ) {
//       // If material doesn't exist or insufficient stock, throw an error
//       throw new Error("material does not exist");
//     }
//     if (inventory.totalQuantity < quantity) {
//       // If material doesn't exist or insufficient stock, throw an error
//       throw new Error("Insufficient stock Available stock is", inventory.totalQuantity);
//     }

//     // Decrease the total quantity
//     inventory.totalQuantity -= quantity;

//     // Save both newDisbursedData and inventory
//     await newDisbursedData.save({ session });
//     await inventory.save({ session });

//     // Commit the transaction
//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json(newDisbursedData);
//   } catch (err) {
//     // Abort the transaction on error
//     await session.abortTransaction();
//     session.endSession();

//     console.error(err);
//     res.status(500).json({ error: "Failed to save disbursed data", details: err.message });
//   }
// };

exports.addDisbursedData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      disbursed = "disbursed",
      recipientName, 
      houseNumber, 
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
    const requiredFields = ["purpose", "houseNumber", "recipientName", "materialCategory", "materialName", "quantity", "unit", "siteLocation", "houseType", "date"];
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
      houseNumber,
      recipientName,
      date: new Date(date)
    });

    // Update inventory
    let inventory = await Inventory.findOne({ materialCategory, materialName, siteLocation, unit }).session(session);
    if (!inventory ) {
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