const PDFDocument = require("pdfkit");

const fs = require("fs");

function generatePDF(studentData, filePath){

    const doc = new PDFDocument({

        size: "A4",
        margin: 50

    });

    doc.pipe(fs.createWriteStream(filePath));

    doc
    .fontSize(24)
    .fillColor("#002b5b")
    .text("JHRC LIBRARY", {

        align: "center"

    });

    doc
    .fontSize(18)
    .fillColor("black")
    .text("Admission Receipt", {

        align: "center"

    });

    doc.moveDown(2);

    doc
    .fontSize(14)
    .fillColor("#002b5b")
    .text("Personal Details");

    doc.moveDown(0.5);

    doc
    .fontSize(12)
    .fillColor("black")
    .text(`Full Name: ${studentData.fullName || ""}`);

    doc.text(`Phone Number: ${studentData.phoneNumber || ""}`);

    doc.text(`Email: ${studentData.email || ""}`);

    doc.text(`Date of Birth: ${studentData.dob || ""}`);

    doc.text(`Gender: ${studentData.gender || ""}`);

    doc.text(`Address: ${studentData.address || ""}`);

    doc.moveDown(1.5);

    doc
    .fontSize(14)
    .fillColor("#002b5b")
    .text("Membership Details");

    doc.moveDown(0.5);

    doc
    .fontSize(12)
    .fillColor("black")
    .text(`Membership Type: ${studentData.membershipType || ""}`);

    doc.text(`Course: ${studentData.course || ""}`);

    doc.text(`Membership Start Date: ${studentData.membershipStartDate || ""}`);

    doc.moveDown(1.5);

    doc
    .fontSize(14)
    .fillColor("#002b5b")
    .text("Emergency Contact");

    doc.moveDown(0.5);

    doc
    .fontSize(12)
    .fillColor("black")
    .text(`Guardian Name: ${studentData.guardianName || ""}`);

    doc.text(`Emergency Contact: ${studentData.emergencyContact || ""}`);

    doc.moveDown(3);

    doc.text("Student Signature __________________");

    doc.moveDown(2);

    doc
    .fontSize(14)
    .fillColor("#002b5b")
    .text("Thank You For Joining JHRC", {

        align: "center"

    });

    doc.end();

}

module.exports = generatePDF;