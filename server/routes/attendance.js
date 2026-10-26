const express = require("express");
const c = require("../controllers/attendanceController");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.post("/check-in", c.checkIn);
router.post("/check-out", c.checkOut);
router.get("/today", c.todayMine);
router.get("/me", c.myAttendance);
router.get("/", allow("hr"), c.allAttendance);

module.exports = router;
