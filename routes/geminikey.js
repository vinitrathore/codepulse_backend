const express = require("express");
const router = express.Router();
const GlobalKey = require("../model/globalkey");
const checkAdmin = require("../middleware/checkadmin"); // only admin can update
const UserKey = require("../model/UserKey")

// --------------------------
// Admin: Set or update Gemini key
// --------------------------
router.post("/set-gemini-key", checkAdmin, async (req, res) => {
  try {
    const { apiKey, prompt } = req.body;
    if (!apiKey) {
      return res.status(400).json({ success: false, message: "Missing API key" });
    }

    const updated = await GlobalKey.findOneAndUpdate(
      { keyName: "GEMINI" },
      { apiKey, prompt: prompt || "", updatedBy: req.user.id, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Gemini key updated", key: updated });
  } catch (err) {
    console.error("Set Gemini Key Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------
// Admin: Get Gemini key (internal use)
// --------------------------
router.get("/gemini-key", checkAdmin, async (req, res) => {
  try {
    const keyDoc = await GlobalKey.findOne({ keyName: "GEMINI" });
    if (!keyDoc) {
      return res.status(404).json({ success: false, message: "Key not set" });
    }

    res.json({ success: true, apiKey: keyDoc.apiKey, prompt: keyDoc.prompt });
  } catch (err) {
    console.error("Get Gemini Key Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------------
// Proxy route: Users call Gemini API with their key
// --------------------------

// router.post("/proxy-gemini", async (req, res) => {
//   const { key } = req.body;
//   const keyDoc = await UserKey.findOne({ key: key });
//   if(keyDoc){
//     const keyDoc1 = await GlobalKey.findOne({keyName:"GEMINI"});
//     console.log(keyDoc1);
//   }
// });

router.post("/proxy-gemini", async (req, res) => {
  try {
    const { key } = req.body;

    /* 1️⃣ Check key provided */
    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Key is required",
      });
    }

    /* 2️⃣ Find USER key */
    const userKeyDoc = await UserKey.findOne({ key: key.trim() });

    if (!userKeyDoc) {
      return res.status(403).json({
        success: false,
        message: "Invalid user key",
      });
    }

    /* 3️⃣ Check remaining requests */
    if (userKeyDoc.requests <= 0) {
      return res.status(403).json({
        success: false,
        message: "Request limit exceeded",
      });
    }

    /* 4️⃣ Get GLOBAL GEMINI key */
    const globalKeyDoc = await GlobalKey.findOne({ keyName: "GEMINI" });

    if (!globalKeyDoc) {
      return res.status(500).json({
        success: false,
        message: "Global Gemini key missing",
      });
    }

    /* 5️⃣ Decrease request count */
    userKeyDoc.requests -= 1;
    await userKeyDoc.save();

    /* 6️⃣ Send final response */
    return res.json({
      success: true,
      apiKey: globalKeyDoc.apiKey,
      prompt: userKeyDoc.prompt || globalKeyDoc.prompt,
      remainingRequests: userKeyDoc.requests,
      plan: userKeyDoc.plan,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


module.exports = router;
