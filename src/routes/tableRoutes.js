const express = require("express");
const {
  addData,
  getAllData,
  filterData,
} = require("../controllers/tableDataController");

const router = express.Router();

// Route to add data
router.post("/data", addData);

// Route to get all data
router.get("/data", getAllData);

// Route to filter data
router.get("/data/filter", filterData);

module.exports = router;
