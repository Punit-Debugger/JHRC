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

```
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
```

}

function generatePDF(studentData, filePath) {

```
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

drawParagraphText(
    doc,
    studentData.fullName,
    120,
    342,
    205,
    48,
    10
);

drawParagraphText(
    doc,
    studentData.fatherName,
    120,
    388,
    205,
    48,
    10
);

drawParagraphText(
    doc,
    studentData.dob,
    120,
    438,
    205,
    38,
    10
);

drawParagraphText(
    doc,
    studentData.mobileNumber,
    120,
    482,
    205,
    38,
    10
);

drawParagraphText(
    doc,
    studentData.email,
    120,
    525,
    205,
    48,
    9
);

drawParagraphText(
    doc,
    studentData.gender,
    120,
    575,
    205,
    38,
    10
);

// =========================
// RIGHT SECTION
// =========================

drawParagraphText(
    doc,
    studentData.course,
    405,
    342,
    145,
    38,
    10
);

drawParagraphText(
    doc,
    studentData.address,
    405,
    388,
    145,
    72,
    9
);

drawParagraphText(
    doc,
    studentData.city,
    405,
    465,
    145,
    38,
    10
);

drawParagraphText(
    doc,
    studentData.state,
    405,
    510,
    145,
    38,
    10
);

drawParagraphText(
    doc,
    studentData.pincode,
    405,
    555,
    145,
    38,
    10
);

// END PDF

doc.end();
```

}

module.exports = generatePDF;
