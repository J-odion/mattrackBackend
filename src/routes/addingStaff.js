const { addStaff, getStaff } = require("../controllers/CreateUser/manageRoles");

router.post("/staff", authorizeRole(["superAdmin"]), addStaff);
router.get("/staff", authorizeRole(["superAdmin", "viewer"]), getStaff);

module.exports = router;
