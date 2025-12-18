const mongoose = require("mongoose");

const UserKeySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: String, enum: ["FREE","PREMIUM","CUSTOM"], required: true },
  key: { type: String, required: true },
  price: { type: Number, required: true },
  requests: { type: Number, required: true },
  prompt: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserKey", UserKeySchema);
