const path = require("path");

const generatePDF = require("./generatePDF");

const sampleData = {

    fullName: "Punit Kumar Agrawal Singhal",

    fatherName: "Rajesh Kumar Agrawal Singhal",

    dob: "2001-05-14",

    mobileNumber: "9876543210",

    email: "punit@gmail.com",

    gender: "Male",

    course: "Student",

    address: "Ward No 12, Near Hanuman Mandir, Mithapur Bazar, Mithapur,Jamnagar, Gujarat", city: "Forbesganj",state: "Bihar",

    pincode: "854318",

    admissionDate: "2026-05-27"

};

const outputPath = path.join(

    __dirname,

    "test-receipt.pdf"

);

generatePDF(sampleData, outputPath);

console.log("PDF Generated Successfully!");