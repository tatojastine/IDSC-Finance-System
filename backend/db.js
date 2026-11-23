
const mongoose = require("mongoose");
const { mongoUri } = require("./config");

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully");
  } catch {
    throw new Error("MongoDB connection failed. Check the database connection settings and network access.");
  }
};

module.exports = connectDB;
