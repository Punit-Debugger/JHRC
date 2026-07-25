require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

const ADMIN_PASSWORD = "JhrcGodhiyari@1991";

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: "jhrcadmin" });
        
        if (existingAdmin) {
            console.log("Admin already exists.");
            await mongoose.connection.close();
            process.exit(0);
        }

        // Hash password using bcrypt
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

        // Create admin user
        const newAdmin = new Admin({
            username: "jhrcadmin",
            passwordHash: passwordHash,
            role: "admin",
            isActive: true
        });

        await newAdmin.save();
        console.log("Admin created successfully.");

        // Close MongoDB connection
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

createAdmin();
