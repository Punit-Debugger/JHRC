const path = require("path");
const generatePDF = require("./generatePDF");

const student = {
    fullName: "Punit Agrawal",
    fatherName: "Ramesh Agrawal",
    dob: "1990-01-01",
    mobileNumber: "9876543210",
    email: "demo@gmail.com",
    gender: "Male",
    course: "ADCA",
    address: "Forbesganj",
    city: "Forbesganj",
    state: "Bihar",
    pincode: "854318",
    admissionDate: "2026-07-25",
    receiptId: "JHRC-TEST-001"
};

const outputPath = path.join(__dirname, "preview.pdf");

generatePDF(student, outputPath, "coaching")
    .then(() => {
        console.log("PDF generated successfully!");
        console.log(outputPath);
    })
    .catch(console.error);