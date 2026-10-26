const Attendance = require("../models/Attendance");

// Today's date in India as "YYYY-MM-DD"
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

const validDay = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

// POST /api/attendance/check-in
exports.checkIn = async (req, res) => {
  try {
    const date = today();
    if (await Attendance.findOne({ user: req.user.id, date }))
      return res.status(409).json({ msg: "You already checked in today" });

    const record = await Attendance.create({ user: req.user.id, date, checkIn: new Date() });
    res.status(201).json({ record });
  } catch (err) {
    // two quick clicks can hit the unique index; treat it the same way
    if (err.code === 11000)
      return res.status(409).json({ msg: "You already checked in today" });
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/attendance/check-out
exports.checkOut = async (req, res) => {
  try {
    const record = await Attendance.findOne({ user: req.user.id, date: today() });
    if (!record) return res.status(400).json({ msg: "Check in first" });
    if (record.checkOut) return res.status(409).json({ msg: "You already checked out today" });

    record.checkOut = new Date();
    await record.save();
    res.json({ record });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/attendance/today   my record for today (or null)
exports.todayMine = async (req, res) => {
  try {
    const record = await Attendance.findOne({ user: req.user.id, date: today() });
    res.json({ record: record || null });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/attendance/me   my last 31 days
exports.myAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id }).sort({ date: -1 }).limit(31);
    res.json({ records });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/attendance?date=YYYY-MM-DD   (HR) everyone's attendance for a day
exports.allAttendance = async (req, res) => {
  try {
    const date = req.query.date === undefined ? today() : req.query.date;
    if (!validDay(date)) return res.status(400).json({ msg: "Date must look like 2026-11-03" });

    const records = await Attendance.find({ date })
      .populate("user", "name email role department")
      .sort({ checkIn: 1 });
    res.json({ date, records });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
