const mongoose = require("mongoose");

const DBConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("Database connected successfully");
  } catch (error) {
    console.error(" Database connection failed");
    console.error(error);

    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = DBConnection;
