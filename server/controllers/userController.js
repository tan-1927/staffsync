const mongoose = require("mongoose");
const User = require("../models/User");
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const Training = require("../models/Training");

const ROLES = ["hr", "manager", "employee"];
const str = (v) => typeof v === "string";

// Turns the request body into clean fields for the HR record.
// Returns { data } or { error }.
const cleanRecord = (b, { partial }) => {
  const data = {};
  const need = (k) => !partial || b[k] !== undefined;

  if (need("name")) {
    if (!str(b.name) || !b.name.trim()) return { error: "Name is required" };
    data.name = b.name.trim();
  }
  if (need("email")) {
    if (!str(b.email) || !/^\S+@\S+\.\S+$/.test(b.email.trim()))
      return { error: "Enter a valid email" };
    data.email = b.email.trim().toLowerCase();
  }
  if (b.role !== undefined) {
    if (!ROLES.includes(b.role)) return { error: "Invalid role" };
    data.role = b.role;
  }
  for (const k of ["department", "designation", "phone", "address"]) {
    if (b[k] !== undefined) {
      if (!str(b[k])) return { error: `Invalid ${k}` };
      data[k] = b[k].trim().slice(0, 200);
    }
  }
  if (b.salary !== undefined && b.salary !== "") {
    const n = Number(b.salary);
    if (!Number.isFinite(n) || n < 0) return { error: "Salary must be a positive number" };
    data.salary = n;
  }
  if (b.joinDate !== undefined && b.joinDate !== "") {
    const d = new Date(b.joinDate);
    if (isNaN(d.getTime())) return { error: "Invalid join date" };
    data.joinDate = d;
  }
  if (b.manager !== undefined) {
    if (b.manager === "" || b.manager === null) data.manager = null;
    else if (mongoose.isValidObjectId(b.manager)) data.manager = b.manager;
    else return { error: "Invalid manager" };
  }
  return { data };
};

// GET /api/users   (HR only) everyone, with HR record
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().populate("manager", "name").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/users/team   (HR + manager) employees only, no salary (used for dropdowns)
exports.team = async (req, res) => {
  try {
    const users = await User.find({ role: "employee" })
      .select("name email department designation")
      .sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/users   (HR only) add a person. body includes a starting password
exports.createUser = async (req, res) => {
  try {
    const { data, error } = cleanRecord(req.body, { partial: false });
    if (error) return res.status(400).json({ msg: error });

    const { password } = req.body;
    if (!str(password) || password.length < 6)
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    if (await User.findOne({ email: data.email }))
      return res.status(400).json({ msg: "Email already registered" });

    const user = await User.create({ ...data, password });
    res.status(201).json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PUT /api/users/:id   (HR only) edit a person
exports.updateUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ msg: "User not found" });

    const { data, error } = cleanRecord(req.body, { partial: true });
    if (error) return res.status(400).json({ msg: error });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // HR cannot demote themselves (would lock the company out of HR tools)
    if (String(user._id) === req.user.id && data.role && data.role !== "hr")
      return res.status(400).json({ msg: "You cannot change your own role" });
    if (data.manager && String(data.manager) === String(user._id))
      return res.status(400).json({ msg: "A person cannot be their own manager" });

    if (data.email && data.email !== user.email) {
      if (await User.findOne({ email: data.email }))
        return res.status(400).json({ msg: "Email already registered" });
    }

    Object.assign(user, data);
    if (str(req.body.password) && req.body.password) {
      if (req.body.password.length < 6)
        return res.status(400).json({ msg: "Password must be at least 6 characters" });
      user.password = req.body.password; // hashed by the model before saving
    }
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// DELETE /api/users/:id   (HR only) remove a person and the records that belong to them
exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(404).json({ msg: "User not found" });
    if (req.params.id === req.user.id)
      return res.status(400).json({ msg: "You cannot delete your own account" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    await Leave.deleteMany({ user: user._id });
    await Attendance.deleteMany({ user: user._id });
    await Training.updateMany({ assignedTo: user._id }, { $pull: { assignedTo: user._id } });
    await User.updateMany({ manager: user._id }, { $unset: { manager: "" } });
    await user.deleteOne();
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/users/me/profile   (anyone logged in)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("manager", "name");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// PUT /api/users/me/profile   (anyone) only name, phone and address.
// Role, salary and department are NOT editable here, so nobody can promote themselves.
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name !== undefined) {
      if (!str(name) || !name.trim()) return res.status(400).json({ msg: "Name is required" });
      user.name = name.trim();
    }
    if (phone !== undefined) {
      if (!str(phone) || !/^[0-9+\-\s]{0,15}$/.test(phone))
        return res.status(400).json({ msg: "Enter a valid phone number" });
      user.phone = phone.trim();
    }
    if (address !== undefined) {
      if (!str(address)) return res.status(400).json({ msg: "Invalid address" });
      user.address = address.trim().slice(0, 200);
    }
    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
