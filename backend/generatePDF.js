const PDFDocument = require("pdfkit");

const fs = require("fs");

const path = require("path");

function generatePDF(studentData, filePath) {

    const doc = new PDFDocument({

        size: "A4",
        margin: 40

    });

    doc.pipe(fs.createWriteStream(filePath));

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

    // PREMIUM BACKGROUND

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

        console.log("Background loaded");

    }

    catch(error){

        console.log("BACKGROUND IMAGE ERROR:");

        console.log(error);

    }

    // LOGO

    try {

        doc.image(

            logoPath,

            55,

            35,

            {

                width: 90

            }

        );

    }

    catch(error){

        console.log("LOGO ERROR:");

        console.log(error);

    }

    // HEADER TEXT

   

    // RECEIPT TITLE

   
    // STUDENT INFORMATION



   // STUDENT INFORMATION

doc
.fillColor("#111111")
.fontSize(11)
.font("Helvetica-Bold")

.text(studentData.fullName || "-", 250, 415)

.text(studentData.fatherName || "-", 250, 452)

.text(studentData.dob || "-", 250, 489)

.text(studentData.mobileNumber || "-", 250, 526)

.text(studentData.email || "-", 250, 563)

.text(studentData.gender || "-", 250, 600);

// ACADEMIC INFORMATION

doc
.fillColor("#111111")
.fontSize(11)
.font("Helvetica-Bold")

.text(studentData.course || "-", 455, 415)

.text(studentData.address || "-", 455, 452)

.text(studentData.city || "-", 455, 489)

.text(studentData.state || "-", 455, 526)

.text(studentData.pincode || "-", 455, 563);

// TOP INFORMATION

const receiptId =
"JHRC-" + Date.now().toString().slice(-6);

const referenceCode =
"JHRC" + Math.floor(Math.random() * 99999);

doc
.fillColor("#b8860b")
.fontSize(14)
.font("Helvetica-Bold")

.text(receiptId, 70, 285)

.text(
    studentData.admissionDate || "-",
    220,
    285
)

.text(referenceCode, 470, 285);

// FOOTER

    // FOOTER

    doc
    .fillColor("#0b1c48")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(

        "THANK YOU FOR CHOOSING JHRC LIBRARY",

        110,

        790,

        {

            width: 380,
            align: "center"

        }

    );

    doc.end();

}

module.exports = generatePDF;