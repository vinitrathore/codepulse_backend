const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../model/User");     // singular "model"
const UserKey = require("../model/UserKey");
const protect = require("../middleware/protect");


// 🔑 Function to generate custom API key
function generateCustomKey() {
  return "KEY-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

// -------------------------------
// 📌 Signup Route
// -------------------------------
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check required fields
    if (!email || !password || !name)
      return res.status(400).json({ error: "Missing fields" });

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ error: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    user = new User({ name, email, password: hash });
    await user.save();

    // Option 1: return success message only
    res.status(201).json({ message: "Signup successful. Please login to get your API key.",status:201 });

    // Option 2: (if you want to log in immediately) return JWT token
    /*
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    res.status(201).json({ token });
    */

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// -------------------------------
// 📌 Signin Route
// -------------------------------

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user in DB
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 3️⃣ Create JWT including role from DB
    const token = jwt.sign(
      { id: user._id, role: user.role }, // ✅ role from DB
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 4️⃣ Get user's API keys
    const keys = await UserKey.find({ userId: user._id }).select("-__v");

    // 5️⃣ Send response
    res.json({
      token,
      role: user.role, // role explicitly sent too
      keys
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




module.exports = router;
