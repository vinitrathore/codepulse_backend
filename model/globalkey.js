const mongoose = require("mongoose");

const GlobalKeySchema = new mongoose.Schema({
  keyName: {
    type: String,
    required: true,
    unique: true,   // e.g. "GEMINI"
  },

  apiKey: {
    type: String,
    required: true,
  },
  
  limit: {
    type: Number,   // total allowed requests
    default: 30,     // 0 = unlimited OR blocked (your choice)
  },

  prompt: {
    type: String,
    default: "",
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model("GlobalKey", GlobalKeySchema);
