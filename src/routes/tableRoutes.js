const express = require("express");
const {
    getInventory, 
    requestMaterial, 
    getMaterialRequest, 
    reviewMaterialRequest,
    filterInventoryData
} = require("../controllers/Tabledata/tablecontroller");
const { verifyToken, requireRole } = require("../middleware/auth");
const { addData, getAllData, filterData } = require("../controllers/Tabledata/recieved");
const { addDisbursedData, getAllDisbursedData, filterDisbursedData } = require("../controllers/Tabledata/disbursed");

const router = express.Router();
// inwards recieved
router.post("/data", addData);
router.get("/data", getAllData);
router.get("/data/filter", filterData);
// outwards disbursed
router.post("/disburseddata", addDisbursedData);
router.get("/disburseddata", getAllDisbursedData);
router.get("/disburseddata/filter", filterDisbursedData);

// records inventory
router.get("/inventory", getInventory);
router.get("/inventory/filter", filterInventoryData )

router.post("/requestMaterial", requestMaterial);
router.put("/reviewMaterialRequest/:requestId", reviewMaterialRequest);
router.get("/requestMaterial", getMaterialRequest);

module.exports = router;
