const express = require("express");
const c = require("../controllers/announcementController");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/", c.list);
router.post("/", allow("hr"), c.create);
router.delete("/:id", allow("hr"), c.remove);

module.exports = router;
