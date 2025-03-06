require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;
console.log("Testing connection to:", uri);

mongoose.connect(uri)
    .then(() => {
        console.log("✅ MongoDB connected successfully!");
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error("❌ Connection failed:", err.message);
    });
