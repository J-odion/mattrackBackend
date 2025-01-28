const { addStaff, getStaff } = require("../controllers/staffController");

router.post("/staff", authorizeRole(["superAdmin"]), addStaff);
router.get("/staff", authorizeRole(["superAdmin", "viewer"]), getStaff);

module.exports = router;
