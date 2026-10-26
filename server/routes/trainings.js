const express = require("express");
const c = require("../controllers/trainingController");
const { protect, allow } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

router.get("/me", c.mine); // must be before "/:id"
router.get("/", allow("hr", "manager"), c.list);
router.post("/", allow("hr", "manager"), c.create);
router.put("/:id", allow("hr", "manager"), c.update);
router.delete("/:id", allow("hr", "manager"), c.remove);

module.exports = router;
