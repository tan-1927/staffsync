const mongoose = require("mongoose");
const Training = require("../models/Training");
const User = require("../models/User");

const STATUSES = ["scheduled", "completed", "cancelled"];

const parseDate = (s) => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return null;
  return d;
};

// Checks that every assigned id is a real employee. Returns an error text or null.
const checkAssignees = async (ids) => {
  if (!Array.isArray(ids)) return "Choose who the training is for";
  if (!ids.every((i) => mongoose.isValidObjectId(i))) return "Invalid employee selected";
  const unique = [...new Set(ids.map(String))];
  const found = await User.find({ _id: { $in: unique }, role: "employee" }).select("_id");
  if (found.length !== unique.length) return "Trainings can only be assigned to employees";
  return null;
};

const populate = (q) => q.populate("assignedTo", "name email").populate("createdBy", "name");

// POST /api/trainings   (manager, HR)
exports.create = async (req, res) => {
  try {
    const { title, description, date, assignedTo } = req.body;
    if (typeof title !== "string" || !title.trim())
      return res.status(400).json({ msg: "Title is required" });
    if (title.trim().length > 120) return res.status(400).json({ msg: "Title is too long" });
    const when = parseDate(date);
    if (!when) return res.status(400).json({ msg: "Enter a valid date" });
    if (description !== undefined && typeof description !== "string")
      return res.status(400).json({ msg: "Invalid description" });
    const bad = await checkAssignees(assignedTo);
    if (bad) return res.status(400).json({ msg: bad });

    const training = await Training.create({
      title,
      description: description || "",
      date: when,
      assignedTo: [...new Set(assignedTo.map(String))],
      createdBy: req.user.id,
    });
    res.status(201).json({ training });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/trainings   (manager sees their own, HR sees all)
exports.list = async (req, res) => {
  try {
    const filter = req.user.role === "manager" ? { createdBy: req.user.id } : {};
    const trainings = await populate(Training.find(filter)).sort({ date: -1 });
    res.json({ trainings });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/trainings/me   (anyone) trainings assigned to me
exports.mine = async (req, res) => {
  try {
    const trainings = await populate(Training.find({ assignedTo: req.user.id })).sort({ date: 1 });
    res.json({ trainings });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// load a training and make sure this person may change it (creator or HR)
const loadOwned = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ msg: "Training not found" });
    return null;
  }
  const t = await Training.findById(req.params.id);
  if (!t) {
    res.status(404).json({ msg: "Training not found" });
    return null;
  }
  if (req.user.role !== "hr" && String(t.createdBy) !== req.user.id) {
    res.status(403).json({ msg: "You can only change trainings you created" });
    return null;
  }
  return t;
};

// PUT /api/trainings/:id   (creator or HR) edit details, assignees or status
exports.update = async (req, res) => {
  try {
    const t = await loadOwned(req, res);
    if (!t) return;
    const { title, description, date, assignedTo, status } = req.body;

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim() || title.trim().length > 120)
        return res.status(400).json({ msg: "Enter a valid title" });
      t.title = title.trim();
    }
    if (description !== undefined) {
      if (typeof description !== "string") return res.status(400).json({ msg: "Invalid description" });
      t.description = description.trim().slice(0, 1000);
    }
    if (date !== undefined) {
      const when = parseDate(date);
      if (!when) return res.status(400).json({ msg: "Enter a valid date" });
      t.date = when;
    }
    if (status !== undefined) {
      if (!STATUSES.includes(status)) return res.status(400).json({ msg: "Invalid status" });
      t.status = status;
    }
    if (assignedTo !== undefined) {
      const bad = await checkAssignees(assignedTo);
      if (bad) return res.status(400).json({ msg: bad });
      t.assignedTo = [...new Set(assignedTo.map(String))];
    }
    await t.save();
    res.json({ training: t });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/trainings/:id   (creator or HR)
exports.remove = async (req, res) => {
  try {
    const t = await loadOwned(req, res);
    if (!t) return;
    await t.deleteOne();
    res.json({ msg: "Training deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
