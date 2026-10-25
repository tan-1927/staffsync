const mongoose = require("mongoose");

// One leave request. "user" points at the person who applied.
const leaveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["casual", "sick", "earned", "unpaid"],
      required: true,
    },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // filled in when a manager or HR decides
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewNote: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

// "days" is not stored, it is calculated from the two dates (inclusive)
leaveSchema.virtual("days").get(function () {
  return Math.round((this.toDate - this.fromDate) / 86400000) + 1;
});

module.exports = mongoose.model("Leave", leaveSchema);
