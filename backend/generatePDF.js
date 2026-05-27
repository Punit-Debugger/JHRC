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

   doc
.fillColor("#111111")
.fontSize(13)
.font("Helvetica-Bold")

.text(studentData.fullName || "-", 250, 355)

.text(studentData.phoneNumber || "-", 250, 470)

.text(studentData.email || "-", 250, 530)

.text(studentData.gender || "-", 250, 590)

.text(studentData.dob || "-", 250, 415);

    // MEMBERSHIP SECTION

    

    // MEMBERSHIP VALUES

    doc
    .fillColor("#222222")
    .fontSize(13)
    .font("Helvetica")

    .text(

        studentData.membershipType || "-",

        250,

        545

    )

    .text(

        studentData.course || "-",

        250,

        585

    )

    .text(

        studentData.membershipStartDate || "-",

        250,

        625

    );

    // EMERGENCY CONTACT

  

    // EMERGENCY VALUES

    doc
    .fillColor("#222222")
    .fontSize(13)
    .font("Helvetica")

    .text(

        studentData.guardianName || "-",

        250,

        705

    )

    .text(

        studentData.emergencyContact || "-",

        250,

        735

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