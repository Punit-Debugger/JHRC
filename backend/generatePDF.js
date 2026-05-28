const PDFDocument = require("pdfkit");

const fs = require("fs");

const path = require("path");

function drawParagraphText(
    doc,
    text,
    x,
    y,
    width,
    height,
    fontSize = 10
) {

    text = String(text || "-").trim();

    doc
    .fontSize(fontSize)
    .text(
        text,
        x,
        y,
        {
            width: width,
            height: height,
            align: "left",
            lineGap: 2
        }
    );

}

function generatePDF(studentData, filePath) {

    const doc = new PDFDocument({

        size: "A4",
        margin: 0

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

    // BACKGROUND

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

    }

    catch(error){

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

        console.log(error);

    }

    doc
    .fillColor("#111111")
    .font(fontPath);

    // =========================
    // TOP SECTION
    // =========================

    const receiptId =
    "JHRC-" + Date.now().toString().slice(-6);

    const referenceCode =
    "JHRC" + Math.floor(Math.random() * 99999);

    doc
    .fillColor("#b8860b")
    .fontSize(12)

    .text(receiptId, 55, 252)

    .text(
        studentData.admissionDate || "-",
        195,
        252
    )

    .text(
        referenceCode,
        470,
        252
    );

    // =========================
    // LEFT SECTION
    // =========================

    doc.fillColor("#111111");

    drawParagraphText(
        doc,
        studentData.fullName,
        125,
        345,
        180,
        38
    );

    drawParagraphText(
        doc,
        studentData.fatherName,
        125,
        390,
        180,
        38
    );

    drawParagraphText(
        doc,
        studentData.dob,
        125,
        435,
        180,
        38
    );

    drawParagraphText(
        doc,
        studentData.mobileNumber,
        125,
        480,
        180,
        38
    );

    drawParagraphText(
        doc,
        studentData.email,
        125,
        525,
        180,
        55,
        9
    );

    drawParagraphText(
        doc,
        studentData.gender,
        125,
        585,
        180,
        38
    );

    // =========================
    // RIGHT SECTION
    // =========================

    drawParagraphText(
        doc,
        studentData.course,
        420,
        345,
        120,
        38
    );

    drawParagraphText(
        doc,
        studentData.address,
        420,
        390,
        120,
        70,
        9
    );

    drawParagraphText(
        doc,
        studentData.city,
        420,
        465,
        120,
        38
    );

    drawParagraphText(
        doc,
        studentData.state,
        420,
        510,
        120,
        38
    );

    drawParagraphText(
        doc,
        studentData.pincode,
        420,
        555,
        120,
        38
    );

    // =========================
    // END PDF
    // =========================

    doc.end();

}

module.exports = generatePDF;