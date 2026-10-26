const mongoose = require("mongoose");
const Announcement = require("../models/Announcement");

// GET /api/announcements   (everyone logged in) newest first
exports.list = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/announcements   (HR)
exports.create = async (req, res) => {
  try {
    const { title, body } = req.body;
    if (typeof title !== "string" || !title.trim())
      return res.status(400).json({ msg: "Title is required" });
    if (typeof body !== "string" || !body.trim())
      return res.status(400).json({ msg: "Message is required" });
    if (title.trim().length > 120) return res.status(400).json({ msg: "Title is too long" });
    if (body.trim().length > 2000) return res.status(400).json({ msg: "Message is too long" });

    const announcement = await Announcement.create({ title, body, postedBy: req.user.id });
    res.status(201).json({ announcement });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/announcements/:id   (HR)
exports.remove = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ msg: "Announcement not found" });
    const found = await Announcement.findById(req.params.id);
    if (!found) return res.status(404).json({ msg: "Announcement not found" });
    await found.deleteOne();
    res.json({ msg: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
