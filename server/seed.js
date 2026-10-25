// Run with:  npm run seed
// Creates demo accounts and a few leave requests so you (and your mentor)
// can try everything right away. Safe to run more than once.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Leave = require("./models/Leave");

const demoUsers = [
  { name: "Hira HR", email: "hr@staffsync.com", role: "hr" },
  { name: "Manav Manager", email: "manager@staffsync.com", role: "manager" },
  { name: "Esha Employee", email: "employee1@staffsync.com", role: "employee" },
  { name: "Eshan Employee", email: "employee2@staffsync.com", role: "employee" },
];

const DEMO_PASSWORD = "Password@123";

// a date N days from today, at midnight UTC
const day = (offset) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + offset);
  return d;
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // remove old demo data so running the seed twice is safe
    const emails = demoUsers.map((u) => u.email);
    const old = await User.find({ email: { $in: emails } }).select("_id");
    await Leave.deleteMany({ user: { $in: old.map((u) => u._id) } });
    await User.deleteMany({ email: { $in: emails } });

    // create one by one so the password hashing in the model runs for each
    const made = {};
    for (const u of demoUsers) {
      made[u.email] = await User.create({ ...u, password: DEMO_PASSWORD });
      console.log(`Created ${u.role}: ${u.email}`);
    }
    const manager = made["manager@staffsync.com"];
    const e1 = made["employee1@staffsync.com"];
    const e2 = made["employee2@staffsync.com"];

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
    console.log("Created 5 demo leave requests");

    console.log(`\nDone. Password for all demo accounts: ${DEMO_PASSWORD}`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
