const express = require("express");
const { addData, getAllData, filterData } = require("../controllers/Tabledata/tablecontroller");

const router = express.Router();

router.post("/data", addData);
router.get("/data", getAllData);
router.get("/data/filter", filterData);

module.exports = router;
