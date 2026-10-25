const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Makes the "wristband": a signed token that carries who you are and your role.
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// Only send safe fields back to the browser (never the password).
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// POST /api/auth/register  (public sign-up, ALWAYS creates an employee)
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (![name, email, password].every((v) => typeof v === "string" && v.trim())) {
      return res
        .status(400)
        .json({ msg: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(400).json({ msg: "Email already registered" });

    // role is not read from the request, so nobody can sign up as HR
    const user = await User.create({ name, email, password });

    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ msg: "Email and password are required" });
    }

    // password is hidden by default, so we ask for it with select("+password")
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: "Invalid email or password" });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /api/auth/me  (needs a token): who am I?
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
