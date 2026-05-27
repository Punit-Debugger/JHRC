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



    // VALUES
// STUDENT INFORMATION

doc
.fillColor("#111111")
.fontSize(13)
.font("Helvetica-Bold")

.text(studentData.fullName || "-", 285, 430)

.text(studentData.fatherName || "-", 285, 475)

.text(studentData.dob || "-", 285, 520)

.text(studentData.mobileNumber || "-", 285, 565)

.text(studentData.email || "-", 285, 610)

.text(studentData.gender || "-", 285, 655);

// ACADEMIC INFORMATION

doc
.fillColor("#111111")
.fontSize(13)
.font("Helvetica-Bold")

.text(studentData.course || "-", 470, 430)

.text(studentData.address || "-", 470, 475)

.text(studentData.city || "-", 470, 520)

.text(studentData.state || "-", 470, 565)

.text(studentData.pincode || "-", 470, 610);

// TOP INFO

const receiptId =
"JHRC-" + Date.now().toString().slice(-6);

const referenceCode =
"JHRC" + Math.floor(Math.random() * 99999);

doc
.fillColor("#b8860b")
.fontSize(15)
.font("Helvetica-Bold")

.text(receiptId, 90, 285)

.text(
    studentData.admissionDate || "-",
    235,
    285
)

.text(referenceCode, 470, 285);

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