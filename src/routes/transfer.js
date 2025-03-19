const express = require("express");
const { transferMaterials, getAllTransfers } = require("../controllers/Tabledata/transfer");

const router = express.Router()

router.post("/transfer", transferMaterials)
router.get('/transfer', getAllTransfers)

module.exports = router