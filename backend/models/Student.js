const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    fullName: String,

    phoneNumber: String,

    email: String,

    dob: String,

    gender: String,

    address: String,

    membershipType: String,

    membershipStartDate: String,

    course: String,

    guardianName: String,

    emergencyContact: String,

    selfiePhoto: String,

    aadhaarFront: String,

    aadhaarBack: String

});

module.exports =
mongoose.model(
    "Student",
    studentSchema
);