const express = require("express");
const { register, login, me } = require("../controllers/authController");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me);

// TEMPORARY test route: proves role blocking works. We delete this later.
router.get("/hr-only", protect, allow("hr"), (req, res) => {
  res.json({ msg: `Hello ${req.user.name}, you are HR and you got in` });
});

module.exports = router;
