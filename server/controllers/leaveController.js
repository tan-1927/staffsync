const mongoose = require("mongoose");
const Leave = require("../models/Leave");
const User = require("../models/User");

const TYPES = ["casual", "sick", "earned", "unpaid"];
const STATUSES = ["pending", "approved", "rejected"];

// "2026-11-03" -> a Date at midnight UTC. Returns null if it is not a real date.
const parseDate = (s) => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00.000Z`);
  if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s) return null; // e.g. 2026-02-31
  return d;
};

// POST /api/leaves   (employee or manager applies)
exports.applyLeave = async (req, res) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;

    if (!TYPES.includes(type)) {
      return res.status(400).json({ msg: "Choose a valid leave type" });
    }
    const from = parseDate(fromDate);
    const to = parseDate(toDate);
    if (!from || !to) {
      return res.status(400).json({ msg: "Enter valid start and end dates" });
    }
    if (to < from) {
      return res.status(400).json({ msg: "End date cannot be before start date" });
    }
    if (typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({ msg: "Please give a reason" });
    }
    if (reason.trim().length > 500) {
      return res.status(400).json({ msg: "Reason is too long (max 500 characters)" });
    }

    // block overlapping requests (same person, dates that touch, not rejected)
    const overlap = await Leave.findOne({
      user: req.user.id,
      status: { $in: ["pending", "approved"] },
      fromDate: { $lte: to },
      toDate: { $gte: from },
    });
    if (overlap) {
      return res
        .status(409)
        .json({ msg: "You already have a pending or approved leave on these dates" });
    }

    const leave = await Leave.create({
      user: req.user.id,
      type,
      fromDate: from,
      toDate: to,
      reason,
    });
    res.status(201).json({ leave });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/leaves/me   (my own requests)
exports.myLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id })
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/leaves?status=pending   (HR sees everyone, a manager sees employees)
exports.allLeaves = async (req, res) => {
  try {
    const filter = {};
    if (STATUSES.includes(req.query.status)) filter.status = req.query.status;

    if (req.user.role === "manager") {
      const employees = await User.find({ role: "employee" }).select("_id");
      filter.user = { $in: employees.map((e) => e._id) };
    }

    const leaves = await Leave.find(filter)
      .populate("user", "name email role")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PATCH /api/leaves/:id   body: { status: "approved" | "rejected", note }
exports.reviewLeave = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ msg: "Status must be approved or rejected" });
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ msg: "Leave request not found" });
    }

    const leave = await Leave.findById(req.params.id).populate(
      "user",
      "name email role"
    );
    if (!leave) return res.status(404).json({ msg: "Leave request not found" });

    if (String(leave.user._id) === req.user.id) {
      return res.status(403).json({ msg: "You cannot review your own leave" });
    }
    // a manager can only decide employee leave; a manager's own leave goes to HR
    if (req.user.role === "manager" && leave.user.role !== "employee") {
      return res.status(403).json({ msg: "Managers can only review employee leave" });
    }
    if (leave.status !== "pending") {
      return res.status(409).json({ msg: `This request is already ${leave.status}` });
    }

    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    leave.reviewNote =
      typeof note === "string" && note.trim() ? note.trim().slice(0, 300) : undefined;
    await leave.save();

    res.json({ leave });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/leaves/:id   (cancel my own request, only while pending)
exports.cancelLeave = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ msg: "Leave request not found" });
    }
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ msg: "Leave request not found" });

    if (String(leave.user) !== req.user.id) {
      return res.status(403).json({ msg: "You can only cancel your own requests" });
    }
    if (leave.status !== "pending") {
      return res.status(409).json({ msg: "Only pending requests can be cancelled" });
    }

    await leave.deleteOne();
    res.json({ msg: "Leave request cancelled" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
