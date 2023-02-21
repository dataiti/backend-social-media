const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connect DB successfully !");
  } catch (error) {
    console.error(`Error: ${error} `);
  }
};

module.exports = connectDB;
