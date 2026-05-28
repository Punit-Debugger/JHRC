const PDFDocument = require("pdfkit");

const fs = require("fs");

const path = require("path");
function drawFittedText(
    doc,
    text,
    x,
    y,
    width,
    maxFontSize = 11,
    minFontSize = 7
) {

    let fontSize = maxFontSize;

    while (
        doc.widthOfString(text) > width &&
        fontSize > minFontSize
    ) {

        fontSize--;

        doc.fontSize(fontSize);

    }

    doc.fontSize(fontSize);

    doc.text(
        text,
        x,
        y,
        {
            width: width,
            align: "center",
            lineBreak: false
        }
    );

    // RESET FONT SIZE
    doc.fontSize(maxFontSize);

}
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

drawFittedText(
    doc,
    studentData.fullName || "-",
    leftX,
    startY + 5,
    160
);

drawFittedText(
    doc,
    (studentData.fatherName || "-").trim(),
    leftX,
    395,
    160
);

drawFittedText(
    doc,
    studentData.dob || "-",
    leftX,
    startY + 70,
    160
);

drawFittedText(
    doc,
    studentData.mobileNumber || "-",
    leftX,
    startY + 115,
    160
);

drawFittedText(
    doc,
    studentData.email || "-",
    leftX,
    495,
    160
);

drawFittedText(
    doc,
    studentData.gender || "-",
    leftX,
    533,
    160
);

// ACADEMIC INFORMATION

const rightX = 470;
const rightStartY = 345;
const rightRowGap = 47;

doc
.fillColor("#111111")
.fontSize(10)
.font(fontPath)

drawFittedText(
    doc,
    studentData.course || "-",
    rightX,
    rightStartY,
    110
);

drawFittedText(
    doc,
    studentData.address || "-",
    rightX,
    rightStartY + rightRowGap,
    110
);

drawFittedText(
    doc,
    studentData.city || "-",
    rightX,
    432,
    110
);

drawFittedText(
    doc,
    studentData.state || "-",
    rightX,
    478,
    110
);

drawFittedText(
    doc,
    studentData.pincode || "-",
    rightX,
    515,
    110
);

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