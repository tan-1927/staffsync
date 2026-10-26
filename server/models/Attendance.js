const mongoose = require("mongoose");

// One row per person per day. "date" is a plain "YYYY-MM-DD" string (India time),
// so a person can only have one row per day.
const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
