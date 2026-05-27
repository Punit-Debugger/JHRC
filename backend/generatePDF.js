const PDFDocument = require("pdfkit");

const fs = require("fs");

const path = require("path");

function generatePDF(studentData, filePath) {

    const doc = new PDFDocument({

        size: "A4",
        margin: 40

    });

    doc.pipe(fs.createWriteStream(filePath));
const fontPath =
path.join(
    __dirname,
    "assets",
    "Poppins-Regular.ttf"
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
.font(fontPath)

const leftX = 175;
const startY = 345;
const rowGap = 34;

doc
.fillColor("#111111")
.fontSize(10)
.font(fontPath)

.text(studentData.fullName || "-", leftX, startY)

.text(studentData.fatherName || "-", leftX, startY + rowGap)

.text(studentData.dob || "-", leftX, startY + rowGap * 2)

.text(studentData.mobileNumber || "-", leftX, startY + rowGap * 3)

.text(studentData.email || "-", leftX, startY + rowGap * 4)

.text(studentData.gender || "-", leftX, startY + rowGap * 5);

// ACADEMIC INFORMATION

const rightX = 470;
const rightStartY = 345;
const rightRowGap = 47;

doc
.fillColor("#111111")
.fontSize(10)
.font(fontPath)

.text(studentData.course || "-", rightX, rightStartY, {

    width: 120

})

.text(studentData.address || "-", rightX, rightStartY + rightRowGap, {

    width: 120

})

.text(studentData.city || "-", rightX, 432)

// STATE slightly upward

.text(studentData.state || "-", rightX, 478)

// PINCODE slightly upward

.text(studentData.pincode || "-", rightX, 525);

// TOP INFORMATION

const receiptId =
"JHRC-" + Date.now().toString().slice(-6);

const referenceCode =
"JHRC" + Math.floor(Math.random() * 99999);

doc
.fillColor("#b8860b")
.fontSize(14)
.font(fontPath)

.text(receiptId, 50, 250)

.text(
    studentData.admissionDate || "-",
    190,
    250
)

.text(referenceCode, 470, 250);

// FOOTER

    // FOOTER

    

    doc.end();

}

module.exports = generatePDF;