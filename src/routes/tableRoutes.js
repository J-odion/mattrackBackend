const express = require("express");
const { 
    addData,  
    getAllData, 
    filterData, 
    addDisbursedData, 
    getAllDisbursedData, 
    filterDisbursedData, 
    getInventory, 
    requestMaterial, 
    getMaterialRequest, 
    reviewMaterialRequest
} = require("../controllers/Tabledata/tablecontroller");
const { verifyToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/data", addData);
router.get("/data", getAllData);
router.get("/data/filter", filterData);

router.post("/disburseddata", addDisbursedData);
router.get("/disburseddata", getAllDisbursedData);
router.get("/disburseddata/filter", filterDisbursedData);

router.get("/inventory", getInventory);

router.post("/requestMaterial", requestMaterial);
router.put("/reviewMaterialRequest/:requestId", reviewMaterialRequest);
router.get("/requestMaterial", getMaterialRequest);

module.exports = router;
