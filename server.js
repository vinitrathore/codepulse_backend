const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const Razorpay = require("razorpay"); // ✅ Import Razorpay

const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ✅ CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.TEST_API_KEY, // Replace with your Razorpay Key ID
  key_secret: process.env.TEST_API_SECRET, // Replace with your Razorpay Secret
});

// Connect database
connectDB();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/keys", require("./routes/keys"));
app.use("/api/ai", require("./routes/geminikey"));

// Basic route
app.get("/", (req, res) => {
  res.send("Server working and DB connected!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
