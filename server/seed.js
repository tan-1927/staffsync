// Run with:  npm run seed
// Creates demo accounts so you (and your mentor) can log in right away.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const demoUsers = [
  { name: "Hira HR", email: "hr@staffsync.com", role: "hr" },
  { name: "Manav Manager", email: "manager@staffsync.com", role: "manager" },
  { name: "Esha Employee", email: "employee1@staffsync.com", role: "employee" },
  { name: "Eshan Employee", email: "employee2@staffsync.com", role: "employee" },
];

const DEMO_PASSWORD = "Password@123";

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // remove old copies of the demo accounts so running the seed twice is safe
    await User.deleteMany({ email: { $in: demoUsers.map((u) => u.email) } });

    // create one by one so the password hashing in the model runs for each
    for (const u of demoUsers) {
      await User.create({ ...u, password: DEMO_PASSWORD });
      console.log(`Created ${u.role}: ${u.email}`);
    }

    console.log(`\nDone. Password for all demo accounts: ${DEMO_PASSWORD}`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
