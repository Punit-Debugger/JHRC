require("dotenv").config({ path: __dirname + "/.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

const USERNAME = "jhrcadmin";
const NEW_PASSWORD = "jhrcforbesganj@123";

async function changeAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // Find admin by username
        const admin = await Admin.findOne({ username: USERNAME });

        if (!admin) {
            console.log("Admin user not found.");
            await mongoose.connection.close();
            process.exit(1);
        }

        // Hash new password using bcrypt (10 salt rounds)
        const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);

        // Update passwordHash
        admin.passwordHash = passwordHash;

        // Save the document
        await admin.save();

        console.log("Password updated successfully.");

        // Close MongoDB connection
        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

changeAdminPassword();
