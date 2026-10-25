const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// A "model" describes what one record in the database looks like.
// This one is a user account: HR, manager or employee.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select:false means the password is never returned unless we ask for it on purpose
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["hr", "manager", "employee"],
      default: "employee",
    },
  },
  { timestamps: true }
);

// Before saving, scramble the password so the real one is never stored.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Used at login: compares what the user typed with the scrambled one in the database.
userSchema.methods.matchPassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
