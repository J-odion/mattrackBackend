const express = require("express");
const { sendMaterials, getTransfers, acceptTransfer } = require("../controllers/Tabledata/transfer");

const router = express.Router()

router.post("/transfer", sendMaterials)
router.post("/transferAccept", acceptTransfer)
router.get('/transfer', getTransfers)

module.exports = router