const mongoose = require("mongoose");

// Define Inventory Schema
const inventorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: false,
    },
    materialName: {
        type: String,
        required: true,
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

// Ensure uniqueness of material per site
inventorySchema.index({ materialName: 1, siteLocation: 1 }, { unique: true });

const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
