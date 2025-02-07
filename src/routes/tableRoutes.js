const express = require("express");
const { addData, getAllData, filterData, addDisbursedData, getAllDisbursedData, filterDisbursedData, getInventory } = require("../controllers/Tabledata/tablecontroller");

const router = express.Router();

router.post("/data", addData);
router.get("/data", getAllData);
router.get("/data/filter", filterData);

router.post("/disburseddata", addDisbursedData);
router.get("/disburseddata", getAllDisbursedData);
router.get("/disburseddata/filter", filterDisbursedData);

router.get("/inventory", getInventory);

module.exports = router;
