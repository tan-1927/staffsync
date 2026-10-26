// Run with:  npm run seed
// Creates demo accounts plus sample leave, attendance, announcements and trainings
// so you (and your mentor) can try everything right away. Safe to run more than once.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Leave = require("./models/Leave");
const Attendance = require("./models/Attendance");
const Announcement = require("./models/Announcement");
const Training = require("./models/Training");

const DEMO_PASSWORD = "Password@123";

const demoUsers = [
  { name: "Hira HR", email: "hr@staffsync.com", role: "hr", department: "Human Resources", designation: "HR Lead", salary: 90000, phone: "9000000001" },
  { name: "Manav Manager", email: "manager@staffsync.com", role: "manager", department: "Engineering", designation: "Engineering Manager", salary: 120000, phone: "9000000002" },
  { name: "Esha Employee", email: "employee1@staffsync.com", role: "employee", department: "Engineering", designation: "Software Engineer", salary: 60000, phone: "9000000003" },
  { name: "Eshan Employee", email: "employee2@staffsync.com", role: "employee", department: "Engineering", designation: "QA Engineer", salary: 50000, phone: "9000000004" },
];

// a date N days from today, at midnight UTC
const day = (offset) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
};
// "YYYY-MM-DD" for N days from today (India time)
const ymd = (offset) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(Date.now() + offset * 86400000)
  );
const at = (offset, hhmm) => new Date(`${ymd(offset)}T${hhmm}:00+05:30`);

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // remove old demo data so running the seed twice is safe
    const emails = demoUsers.map((u) => u.email);
    const old = await User.find({ email: { $in: emails } }).select("_id");
    const oldIds = old.map((u) => u._id);
    await Leave.deleteMany({ user: { $in: oldIds } });
    await Attendance.deleteMany({ user: { $in: oldIds } });
    await Announcement.deleteMany({ postedBy: { $in: oldIds } });
    await Training.deleteMany({ createdBy: { $in: oldIds } });
    await User.deleteMany({ email: { $in: emails } });

    // create one by one so the password hashing in the model runs for each
    const made = {};
    for (const u of demoUsers) {
      made[u.email] = await User.create({ ...u, password: DEMO_PASSWORD, joinDate: day(-400) });
      console.log(`Created ${u.role}: ${u.email}`);
    }
    const hr = made["hr@staffsync.com"];
    const manager = made["manager@staffsync.com"];
    const e1 = made["employee1@staffsync.com"];
    const e2 = made["employee2@staffsync.com"];

    // people report to the manager; the manager reports to HR
    await User.updateMany({ _id: { $in: [e1._id, e2._id] } }, { manager: manager._id });
    await User.updateOne({ _id: manager._id }, { manager: hr._id });

    await Leave.create([
      { user: e1._id, type: "casual", fromDate: day(7), toDate: day(8), reason: "Family function" },
      {
        user: e1._id, type: "sick", fromDate: day(-5), toDate: day(-4), reason: "Fever, doctor advised rest",
        status: "approved", reviewedBy: manager._id, reviewedAt: day(-6),
      },
      { user: e2._id, type: "earned", fromDate: day(14), toDate: day(18), reason: "Family vacation" },
      {
        user: e2._id, type: "casual", fromDate: day(2), toDate: day(2), reason: "Personal work",
        status: "rejected", reviewedBy: manager._id, reviewedAt: day(-1),
        reviewNote: "Release week, please reschedule",
      },
      { user: manager._id, type: "casual", fromDate: day(20), toDate: day(21), reason: "Out of town" },
    ]);

    await Attendance.create([
      { user: e1._id, date: ymd(-1), checkIn: at(-1, "09:05", "00"), checkOut: at(-1, "18:00", "00") },
      { user: e2._id, date: ymd(-1), checkIn: at(-1, "09:40", "00"), checkOut: at(-1, "17:45", "00") },
      { user: manager._id, date: ymd(-1), checkIn: at(-1, "08:55", "00"), checkOut: at(-1, "18:30", "00") },
      { user: e1._id, date: ymd(-2), checkIn: at(-2, "09:00", "00"), checkOut: at(-2, "17:50", "00") },
    ]);

    await Announcement.create([
      { title: "Welcome to StaffSync", body: "Apply for leave, mark attendance and read company news, all in one place.", postedBy: hr._id },
      { title: "Office closed on Diwali", body: "The office will be closed for Diwali. Enjoy the festival with your family!", postedBy: hr._id },
    ]);

    await Training.create([
      {
        title: "Secure coding basics", description: "Common web vulnerabilities and how to avoid them.",
        date: day(10), assignedTo: [e1._id, e2._id], createdBy: manager._id,
      },
      {
        title: "Git and code review workflow", description: "Branching, pull requests and review etiquette.",
        date: day(-9), status: "completed", assignedTo: [e1._id], createdBy: manager._id,
      },
    ]);

    console.log("Created demo leaves, attendance, announcements and trainings");
    console.log(`\nDone. Password for all demo accounts: ${DEMO_PASSWORD}`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
