const jwt = require("jsonwebtoken");

// protect = "show me your wristband (token)".
// Blocks anyone who isn't logged in, and remembers who they are in req.user.
exports.protect = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) return res.status(401).json({ msg: "Not logged in (no token)" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, name }
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

// allow("hr", "manager") = "only these roles may pass".
// Always use it AFTER protect, because it needs req.user.
exports.allow =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ msg: "Forbidden: your role cannot do this" });
    }
    next();
  };
