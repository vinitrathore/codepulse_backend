// routes/keys.js
const express = require("express");
const router = express.Router();
const UserKey = require("../model/UserKey");
const check = require("../middleware/protect");



router.post("/save", check, async (req, res) => {
  try {
    const { key, plan, price, requests, prompt } = req.body;

    if (!key || !plan) {
      return res.status(400).json({
        success: false,
        message: "Missing data",
      });
    }

    /* 🔍 Find existing key for same user + plan */
    const userKey = await UserKey.findOne({
      userId: req.user.id,
      plan,
    });

    /* 🚫 BLOCK FREE PLAN REGENERATION */
    if (userKey && plan === "FREE") {
      return res.status(403).json({
        success: false,
        message: "Free API key already generated",
      });
    }

    /* 🔁 UPDATE for PREMIUM / CUSTOM */
    if (userKey) {
      userKey.key = key;
      userKey.price = Number(price);
      userKey.requests = Number(requests);
      userKey.prompt = prompt || userKey.prompt;

      await userKey.save();

      return res.json({
        success: true,
        message: "API key updated",
        userKey,
      });
    }

    /* ➕ CREATE new key */
    const newKey = new UserKey({
      userId: req.user.id,
      key,
      plan,
      price: Number(price),
      requests: Number(requests),
      prompt: prompt || "",
    });

    await newKey.save();

    res.json({
      success: true,
      message: "API key created",
      userKey: newKey,
    });

  } catch (err) {
    console.error("SAVE KEY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// router.post("/save", check, async (req, res) => {
//   try {
//     const { key, plan, price, requests, prompt } = req.body;

//     if (!key || !plan) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing data",
//       });
//     }

//     // 🔍 check if key already exists for SAME user + SAME plan
//     let userKey = await UserKey.findOne({
//       userId: req.user.id,
//       plan: plan,
//     });

//     if (userKey) {
//       // 🔁 UPDATE existing key
//       userKey.key = key;
//       userKey.price = Number(price);
//       userKey.requests = Number(requests);
//       userKey.prompt = prompt || userKey.prompt;

//       await userKey.save();

//       return res.json({
//         success: true,
//         message: "API key updated",
//         userKey,
//       });
//     }

//     // ➕ CREATE new key for different plan
//     const newKey = new UserKey({
//       userId: req.user.id,
//       key,
//       plan,
//       price: Number(price),
//       requests: Number(requests),
//       prompt: prompt || "",
//     });

//     await newKey.save();

//     res.json({
//       success: true,
//       message: "API key created",
//       userKey: newKey,
//     });
//   } catch (err) {
//     console.error("SAVE KEY ERROR:", err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// });

// GET all API keys for the authenticated user
router.get("/", check, async (req, res) => {
  try {
    // Find all keys for the user
    const userKeys = await UserKey.find({ userId: req.user.id });

    if (!userKeys || userKeys.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No API keys found for this user",
      });
    }

    res.json({
      success: true,
      keys: userKeys,
    });
  } catch (err) {
    console.error("GET USER KEYS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
