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
function generatePDF(studentData, filePath, module = "library") {

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

    // Determine module-specific text and background
    const moduleText = {
        library: {
            organization: "JHRC LIBRARY",
            receiptType: "ADMISSION CONFIRMATION RECEIPT",
            backgroundImage: "receipt-bg.jpg"
        },
        coaching: {
            organization: "JHRC COMPUTER COACHING",
            receiptType: "COACHING ADMISSION RECEIPT",
            backgroundImage: "receipt-bg-coaching.jpg"
        }
    };

    const moduleConfig = moduleText[module] || moduleText.library;

    const receiptBg =
    path.join(
        __dirname,
        "assets",
        moduleConfig.backgroundImage
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
    // COORDINATE SYSTEMS (Module-Specific)
    // =========================

    // Library coordinates (existing, production-tested)
    const libraryCoordinates = {
        receiptId: { x: 35, y: 266 },
        admissionDate: { x: 180, y: 266 },
        referenceCode: { x: 470, y: 252 },
        fullName: { x: 135, y: 378, width: 250, height: 42, fontSize: 9 },
        fatherName: { x: 135, y: 415, width: 250, height: 42, fontSize: 9 },
        dob: { x: 135, y: 455, width: 180, height: 38, fontSize: 10 },
        mobileNumber: { x: 135, y: 497, width: 180, height: 38, fontSize: 10 },
        email: { x: 135, y: 538, width: 220, height: 55, fontSize: 9 },
        gender: { x: 135, y: 580, width: 180, height: 38, fontSize: 10 },
        course: { x: 393, y: 376, width: 120, height: 38, fontSize: 10 },
        address: { x: 393, y: 418, width: 180, height: 75, fontSize: 9 },
        city: { x: 393, y: 498, width: 120, height: 38, fontSize: 10 },
        state: { x: 393, y: 538, width: 120, height: 38, fontSize: 10 },
        pincode: { x: 393, y: 580, width: 120, height: 38, fontSize: 10 }
    };

    // Coaching coordinates (dedicated, independent system)
    const coachingCoordinates = {
        receiptId: { x: 35, y: 266 },
        admissionDate: { x: 180, y: 266 },
        referenceCode: { x: 470, y: 252 },
        fullName: { x: 135, y: 378, width: 250, height: 42, fontSize: 9 },
        fatherName: { x: 135, y: 415, width: 250, height: 42, fontSize: 9 },
        dob: { x: 135, y: 455, width: 180, height: 38, fontSize: 10 },
        mobileNumber: { x: 135, y: 497, width: 180, height: 38, fontSize: 10 },
        email: { x: 135, y: 538, width: 220, height: 55, fontSize: 9 },
        gender: { x: 135, y: 580, width: 180, height: 38, fontSize: 10 },
        course: { x: 393, y: 376, width: 120, height: 38, fontSize: 10 },
        address: { x: 393, y: 418, width: 180, height: 75, fontSize: 9 },
        city: { x: 393, y: 498, width: 120, height: 38, fontSize: 10 },
        state: { x: 393, y: 538, width: 120, height: 38, fontSize: 10 },
        pincode: { x: 393, y: 580, width: 120, height: 38, fontSize: 10 }
    };

    const coordinates = module === "coaching" ? coachingCoordinates : libraryCoordinates;

    // =========================
    // TOP SECTION
    // =========================

    const receiptId = studentData.receiptId || "-";
    "JHRC-" + Date.now().toString().slice(-6);

    const referenceCode = ""; 

    doc
    .fillColor("#b8860b")
    .fontSize(12)

    .text(receiptId, coordinates.receiptId.x, coordinates.receiptId.y)

    .text(
        studentData.admissionDate || "-",
        coordinates.admissionDate.x,
        coordinates.admissionDate.y
    )

    .text(
        referenceCode,
        coordinates.referenceCode.x,
        coordinates.referenceCode.y
    );

    // =========================
// LEFT SECTION
// =========================

doc.fillColor("#111111");

drawParagraphText(
    doc,
    studentData.fullName ||
    `${studentData.firstName || ""} ${studentData.lastName || ""}`,
    coordinates.fullName.x,
    coordinates.fullName.y,
    coordinates.fullName.width,
    coordinates.fullName.height,
    coordinates.fullName.fontSize
);

drawParagraphText(
    doc,
    studentData.fatherName ||
    studentData.guardian ||
    "-",
    coordinates.fatherName.x,
    coordinates.fatherName.y,
    coordinates.fatherName.width,
    coordinates.fatherName.height,
    coordinates.fatherName.fontSize
);

drawParagraphText(
    doc,
    studentData.dob,
    coordinates.dob.x,
    coordinates.dob.y,
    coordinates.dob.width,
    coordinates.dob.height,
    coordinates.dob.fontSize
);

drawParagraphText(
    doc,
    studentData.mobileNumber ||
    studentData.phone ||
    "-",
    coordinates.mobileNumber.x,
    coordinates.mobileNumber.y,
    coordinates.mobileNumber.width,
    coordinates.mobileNumber.height,
    coordinates.mobileNumber.fontSize
);

drawParagraphText(
    doc,
    studentData.email,
    coordinates.email.x,
    coordinates.email.y,
    coordinates.email.width,
    coordinates.email.height,
    coordinates.email.fontSize
);

drawParagraphText(
    doc,
    studentData.gender,
    coordinates.gender.x,
    coordinates.gender.y,
    coordinates.gender.width,
    coordinates.gender.height,
    coordinates.gender.fontSize
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
    coordinates.course.x,
    coordinates.course.y,
    coordinates.course.width,
    coordinates.course.height,
    coordinates.course.fontSize
);
drawAddressText(
    doc,
    studentData.address,
    coordinates.address.x,
    coordinates.address.y,
    coordinates.address.width,
    coordinates.address.height
);


drawParagraphText(
    doc,
    studentData.city,
    coordinates.city.x,
    coordinates.city.y,
    coordinates.city.width,
    coordinates.city.height,
    coordinates.city.fontSize
);

drawParagraphText(
    doc,
    studentData.state,
    coordinates.state.x,
    coordinates.state.y,
    coordinates.state.width,
    coordinates.state.height,
    coordinates.state.fontSize
);

drawParagraphText(
    doc,
    studentData.pincode,
    coordinates.pincode.x,
    coordinates.pincode.y,
    coordinates.pincode.width,
    coordinates.pincode.height,
    coordinates.pincode.fontSize
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