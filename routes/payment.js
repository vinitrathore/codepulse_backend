const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const UserKey = require("../model/UserKey");

const razorpay = new Razorpay({
  key_id: process.env.TEST_API_KEY,
  key_secret: process.env.TEST_API_SECRET,
});

// 🔑 Custom API Key Generator
function generateCustomKey() {
  return "KEY-" + Math.random().toString(36).substring(2, 12).toUpperCase();
}

/* -----------------------------------
    CREATE RAZORPAY ORDER
------------------------------------ */
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Razorpay order creation failed" });
  }
});

/* -----------------------------------
    VERIFY PAYMENT & CREATE KEY
------------------------------------ */
router.post("/verify-payment", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan,
    prompt,
    amount,
    userId, // pass userId from frontend
  } = req.body;

  // Signature verification
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.TEST_API_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      const requests =
        plan === "CUSTOM" ? (amount / 5) * 40 : plan === "PREMIUM" ? 40 : 30;

      const key = generateCustomKey();

      const userKey = new UserKey({
        userId, // use userId from request
        plan,
        key,
        price: amount,
        requests,
        prompt:
          prompt || "You are a helpful AI assistant. Answer clearly and politely.",
      });

      await userKey.save();
      res.json({ success: true, userKey });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Key creation failed" });
    }
  } else {
    res
      .status(400)
      .json({ success: false, message: "Payment verification failed" });
  }
});

module.exports = router;
