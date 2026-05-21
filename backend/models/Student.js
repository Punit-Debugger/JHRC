const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    firstName:String,

    lastName:String,

    email:String,

    phone:String,

    dob:String,

    gender:String,

    address:String,

    studentId:String,

    course:String,

    department:String,

    semester:String,

    membershipType:String,

    startDate:String,

    guardian:String,

    emergencyPhone:String

});

module.exports = mongoose.model(
    "Student",
    studentSchema
);