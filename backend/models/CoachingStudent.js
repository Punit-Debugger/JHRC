const mongoose = require("mongoose");

const coachingStudentSchema = new mongoose.Schema({

    fullName: String,

    phoneNumber: String,

    email: String,

    dob: String,

    gender: String,

    address: String,

    course: {
        type: String,
        required: true
    },

    guardianName: String,

    emergencyContact: String,

    selfiePhoto: String,

    aadhaarFront: String,

    aadhaarBack: String,

    fatherName: String,

    mobileNumber: String,

    city: String,

    state: String,

    pincode: String,

    status: {
        type: String,
        default: "Pending"
    },

    pdfUrl: String,

    receiptId: String,

    admissionDate: String

});

module.exports = mongoose.model(
    "CoachingStudent",
    coachingStudentSchema
);
