// middleware/checkAdmin.js
const jwt = require("jsonwebtoken");
const User = require("../model/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    req.user = decoded; // SAME STYLE (id, role already inside token)
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
