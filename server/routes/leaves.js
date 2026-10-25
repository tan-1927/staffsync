const express = require("express");
const {
  applyLeave,
  myLeaves,
  allLeaves,
  reviewLeave,
  cancelLeave,
} = require("../controllers/leaveController");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // everything below needs a login

router.post("/", allow("employee", "manager"), applyLeave);
router.get("/me", allow("employee", "manager"), myLeaves);
router.get("/", allow("hr", "manager"), allLeaves);
router.patch("/:id", allow("hr", "manager"), reviewLeave);
router.delete("/:id", allow("employee", "manager"), cancelLeave);

module.exports = router;
