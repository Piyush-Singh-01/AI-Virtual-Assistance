const mongoose = require("mongoose");

const DBConnection = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connection successful");
    } catch (error) {
        console.log("Database connection failed",error);
    }
}

module.exports = DBConnection;