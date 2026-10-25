require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Allow the React app (local + deployed) to call this API
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // allow tools like Postman (no origin) and whitelisted frontends
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

// Health check (Render uses this too)
app.get("/", (req, res) => res.json({ msg: "StaffSync API is running" }));

// ---- Routes get mounted here in the next steps ----
app.use("/api/auth", require("./routes/auth"));
// app.use("/api/employees", require("./routes/employees"));
// app.use("/api/leaves", require("./routes/leaves"));
// app.use("/api/attendance", require("./routes/attendance"));
// app.use("/api/announcements", require("./routes/announcements"));
// app.use("/api/trainings", require("./routes/trainings"));

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ msg: err.message || "Server error" });
});

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
