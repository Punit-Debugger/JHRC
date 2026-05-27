const PDFDocument = require("pdfkit");

const fs = require("fs");

const path = require("path");

function generatePDF(studentData, filePath){

    const doc = new PDFDocument({

        size: "A4",
        margin: 40

    });

    doc.pipe(fs.createWriteStream(filePath));
    doc.image(

    receiptBg,

    0,

    0,

    {

        width: 595,
        height: 842

    }

);

    const logoPath =
path.join(
    __dirname,
    "assets",
    "logo.png"
);
const receiptBg =
path.join(
    __dirname,
    "assets",
    "receipt-bg.jpg"
);
    doc.rect(0, 0, 595, 100)
    .fill("#002b5b");

    try {

    doc.image(

        receiptBg,

        0,

        0,

        {

            width: 595,
            height: 842

        }

    );

    console.log("Background image loaded");

}

catch(error){

    console.log("IMAGE ERROR:");

    console.log(error);

}
    doc
    .fillColor("white")
    .fontSize(28)
    .text(

        "JHRC LIBRARY",

        130,

        30

    );

    doc
    .fontSize(14)
    .text(

        "Official Admission Receipt",

        132,

        65

    );

    doc.moveDown(4);

    doc
    .fillColor("#002b5b")
    .fontSize(18)
    .text("Student Information", {

        underline: true

    });

    doc.moveDown(1);

    const startY = 170;

    doc
    .roundedRect(40, startY, 515, 180, 10)
    .stroke("#002b5b");

    doc
    .fillColor("black")
    .fontSize(13)

    .text(

        `Full Name: ${studentData.fullName || ""}`,

        60,

        startY + 20

    )

    .text(

        `Phone Number: ${studentData.phoneNumber || ""}`,

        60,

        startY + 50

    )

    .text(

        `Email Address: ${studentData.email || ""}`,

        60,

        startY + 80

    )

    .text(

        `Gender: ${studentData.gender || ""}`,

        60,

        startY + 110

    )

    .text(

        `Date of Birth: ${studentData.dob || ""}`,

        60,

        startY + 140

    );

    doc.moveDown(10);

    const membershipY = 390;

    doc
    .fillColor("#002b5b")
    .fontSize(18)
    .text("Membership Details", 40, membershipY);

    doc
    .roundedRect(40, membershipY + 30, 515, 140, 10)
    .stroke("#002b5b");

    doc
    .fillColor("black")
    .fontSize(13)

    .text(

        `Membership Type: ${studentData.membershipType || ""}`,

        60,

        membershipY + 55

    )

    .text(

        `Course / Department: ${studentData.course || ""}`,

        60,

        membershipY + 90

    )

    .text(

        `Membership Start Date: ${studentData.membershipStartDate || ""}`,

        60,

        membershipY + 125

    );

    const emergencyY = 590;

    doc
    .fillColor("#002b5b")
    .fontSize(18)
    .text("Emergency Contact", 40, emergencyY);

    doc
    .roundedRect(40, emergencyY + 30, 515, 100, 10)
    .stroke("#002b5b");

    doc
    .fillColor("black")
    .fontSize(13)

    .text(

        `Guardian Name: ${studentData.guardianName || ""}`,

        60,

        emergencyY + 55

    )

    .text(

        `Emergency Contact Number: ${studentData.emergencyContact || ""}`,

        60,

        emergencyY + 90

    );

    doc
    .fillColor("#777")
    .fontSize(11)
    .text(

        "This is a system generated admission receipt.",

        40,

        760,

        {

            align: "center"

        }

    );

    doc.end();

}

module.exports = generatePDF;