const PDFDocument = require("pdfkit");

const fs = require("fs");

const path = require("path");
function drawAddressText(
    doc,
    text,
    x,
    y,
    width,
    height
) {
    doc
        .fontSize(9)
        .text(
            String(text || "-").trim(),
            x,
            y,
            {
                width,
                height,
                align: "left",
                lineGap: 5
            }
        );
}
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
                width,
                height,
                align: "left",
                lineGap: 1
            }
        );
}
function generatePDF(studentData, filePath) {

    const doc = new PDFDocument({

        size: "A4",
        margin: 0

    });

    const stream =
fs.createWriteStream(filePath);

doc.pipe(stream);

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

            57,

            40,

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

    const receiptId = studentData.receiptId || "-";
    "JHRC-" + Date.now().toString().slice(-6);

    const referenceCode = ""; 

    doc
    .fillColor("#b8860b")
    .fontSize(12)

    .text(receiptId, 45, 252)

    .text(
        studentData.admissionDate || "-",
        185,
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
    studentData.fullName ||
    `${studentData.firstName || ""} ${studentData.lastName || ""}`,
    135,
    365,
    250,
    42,
    9
);

drawParagraphText(
    doc,
    studentData.fatherName ||
    studentData.guardian ||
    "-",
    135,
    403,
    250,
    42,
    9
);

drawParagraphText(
    doc,
    studentData.dob,
    135,
    445,
    180,
    38
);

drawParagraphText(
    doc,
    studentData.mobileNumber ||
    studentData.phone ||
    "-",
    135,
    487,
    180,
    38
);

drawParagraphText(
    doc,
    studentData.email,
    135,
    528,
    220,
    55,
    9
);

drawParagraphText(
    doc,
    studentData.gender,
    135,
    565,
    180,
    38
);

    // =========================
    // RIGHT SECTION
    // =========================

   // =========================
// RIGHT SECTION
// =========================

drawParagraphText(
    doc,
    studentData.course,
    400,
    370,
    120,
    38
);
drawAddressText(
    doc,
    studentData.address,
     400,
    410,
    180,
    75,
    9
);


drawParagraphText(
    doc,
    studentData.city,
    400,
    488,
    120,
    38
);

drawParagraphText(
    doc,
    studentData.state,
    400,
    530,
    120,
    38
);

drawParagraphText(
    doc,
    studentData.pincode,
    400,
    570,
    120,
    38
);

    // =========================
    // END PDF
    // =========================

    return new Promise((resolve, reject) => {

    stream.on("finish", () => {

        resolve();

    });

    stream.on("error", reject);

    doc.end();

});

}

module.exports = generatePDF;