const mongoose = require("mongoose");

// Define Inventory Schema
const inventorySchema = new mongoose.Schema({
    materialCategory: {
        type: String,
        required: true,
    },
    materialName: {
        type: String,
        required: true,
        unique: true,
    },
    totalQuantity: {
        type: Number,
        required: true,
        default: 0,
    },
    unit: {
        type: String,
        required: true,
    },
    siteLocation: {
        type: String,
        required: true,
    },
});

// Create Model
const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;