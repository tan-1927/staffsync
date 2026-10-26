const express = require("express");
const c = require("../controllers/userController");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// "/me/profile" and "/team" must come before "/:id", or Express would treat "me" as an id
router.get("/me/profile", c.getProfile);
router.put("/me/profile", c.updateProfile);
router.get("/team", allow("hr", "manager"), c.team);

router.get("/", allow("hr"), c.listUsers);
router.post("/", allow("hr"), c.createUser);
router.put("/:id", allow("hr"), c.updateUser);
router.delete("/:id", allow("hr"), c.deleteUser);

module.exports = router;
