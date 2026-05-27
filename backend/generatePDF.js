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
.fontSize(10)
.font("Helvetica-Bold")

.text(studentData.fullName || "-", 325, 398)

.text(studentData.fatherName || "-", 325, 436)

.text(studentData.dob || "-", 325, 474)

.text(studentData.mobileNumber || "-", 325, 512)

.text(studentData.email || "-", 325, 550)

.text(studentData.gender || "-", 325, 588);

// ACADEMIC INFORMATION

doc
.fillColor("#111111")
.fontSize(10)
.font("Helvetica-Bold")

.text(studentData.course || "-", 520, 398)

.text(studentData.address || "-", 520, 436)

.text(studentData.city || "-", 520, 474)

.text(studentData.state || "-", 520, 512)

.text(studentData.pincode || "-", 520, 550);

// TOP INFORMATION

const receiptId =
"JHRC-" + Date.now().toString().slice(-6);

const referenceCode =
"JHRC" + Math.floor(Math.random() * 99999);

doc
.fillColor("#b8860b")
.fontSize(14)
.font("Helvetica-Bold")

.text(receiptId, 70, 250)

.text(
    studentData.admissionDate || "-",
    220,
    250
)

.text(referenceCode, 470, 250);

// FOOTER

    // FOOTER

    doc
    .fillColor("#0b1c48")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(

        "THANK YOU FOR CHOOSING JHRC LIBRARY",

        110,

        760,

        {

            width: 380,
            align: "center"

        }

    );

    doc.end();

}

module.exports = generatePDF;