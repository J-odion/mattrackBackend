const { authorizeRole } = require("../middleware/authorization");
const router = require("express").Router();
const { createUser, getUsers, updateUserRole } = require("../controllers/userController");

router.post("/users", authorizeRole(["superAdmin"]), createUser);
router.get("/users", authorizeRole(["superAdmin"]), getUsers);
router.put("/users/:id/role", authorizeRole(["superAdmin"]), updateUserRole);

module.exports = router;
