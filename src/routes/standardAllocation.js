const express = require("express");
const { createStandardAllocation, updateStandardAllocation, getAllStandardAllocations, getStandardAllocationById, deleteStandardAllocation } = require("../controllers/standardAllocation");
const { verifyToken, requireRole } = require("../middleware/auth");


const router = express.Router();

router.get("/schedule", getAllStandardAllocations); // Public: Get all allocations
router.get("/schedule:id", getStandardAllocationById); // Public: Get single allocation

router.post("/schedule", createStandardAllocation); // Admin: Create allocation
router.put("/schedule:id", updateStandardAllocation); // Admin: Update allocation
router.delete("/schedule:id", deleteStandardAllocation); // Admin: Delete allocation


module.exports = router;
