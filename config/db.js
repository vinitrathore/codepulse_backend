const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
     });

    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed:", error);
    process.exit(1); // stop server if DB fails
  }
};

module.exports = connectDB;
