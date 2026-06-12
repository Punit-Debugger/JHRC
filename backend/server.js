require("dotenv").config();

const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const path = require("path");

const multer = require("multer");

const Student = require("./models/Student");
const app = express();
const generatePDF = require("./generatePDF");
const cloudinary = require("./cloudinary");
console.log(
    "Cloudinary uploader:",
    cloudinary.uploader
);
const {
    CloudinaryStorage
} = require("multer-storage-cloudinary");

app.use(cors());



app.use(express.json());

app.use(
    "/pdfs",
    express.static(
        path.join(__dirname, "pdfs")
    )
);

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

mongoose.connect(process.env.MONGO_URI)


.then(() => {

    console.log("MongoDB Connected");

})

.catch((error) => {

    console.log(error);

});

const storage =
new CloudinaryStorage({

    cloudinary: cloudinary,

    params: {

        folder: "jhrc-aadhaar",

        allowed_formats: [

            "jpg",
            "jpeg",
            "png",
            "pdf"

        ]

    }

});

const upload = multer({

    storage

});

app.get("/", (req, res) => {

    res.send("Library Backend Running Successfully");

});
app.get("/seat-status", async (req, res) => {

    try {

        const students =
        await Student.find()
        .sort({ seatNumber: 1 });

        res.json(students);

    }

    catch(error){

        res.status(500).json({
            message: "Server Error"
        });

    }

});
app.get("/available-seats", async (req, res) => {

    try {

        let requestedShifts = req.query.shifts;

        if (!requestedShifts) {
            return res.json({
                availableSeats: Array.from(
                    { length: 65 },
                    (_, i) => i + 1
                )
            });
        }

        requestedShifts = requestedShifts.split(",");

        if (requestedShifts.includes("FULL")) {
            requestedShifts = ["S1","S2","S3","S4"];
        }

        const students = await Student.find();

        const occupiedSeats = [];

        students.forEach(student => {

            let studentShifts = student.shifts || [];

            if (studentShifts.includes("FULL")) {
                studentShifts = ["S1","S2","S3","S4"];
            }

            const conflict = requestedShifts.some(
                shift => studentShifts.includes(shift)
            );

            if (conflict) {
                occupiedSeats.push(student.seatNumber);
            }

        });

        const availableSeats = [];

        for (let i = 1; i <= 65; i++) {

            if (!occupiedSeats.includes(i)) {
                availableSeats.push(i);
            }

        }

        res.json({ availableSeats });

    }

    catch(error){

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});
app.post(

    "/admission",

    upload.fields([

        {

            name: "aadhaarFront",
            maxCount: 1

        },

        {

            name: "aadhaarBack",
            maxCount: 1

        }

    ]),

    async (req, res) => {

        try {
            const receiptId = "JHRC-" + Date.now().toString().slice(-6);
            const studentData = {

                ...req.body,
                receiptId,
               aadhaarFront:
req.files?.aadhaarFront?.[0]?.path || "",

aadhaarBack:
req.files?.aadhaarBack?.[0]?.path || "",

            };
            console.log(req.body);
            console.log("FILES:", req.files);
console.log("BODY:", req.body);
console.log("STUDENT DATA:", studentData);
const requestedSeat =
Number(studentData.seatNumber);

let requestedShifts =
studentData.shifts || [];

if (!Array.isArray(requestedShifts)) {
    requestedShifts = [requestedShifts];
}

if (requestedShifts.includes("FULL")) {
    requestedShifts =
    ["S1","S2","S3","S4"];
}

const existingStudents =
await Student.find({
    seatNumber: requestedSeat
});

for (const student of existingStudents) {

    let occupiedShifts =
    student.shifts || [];

    if (
        occupiedShifts.includes("FULL")
    ) {

        occupiedShifts =
        ["S1","S2","S3","S4"];

    }

    const conflict =
    requestedShifts.some(
        shift =>
        occupiedShifts.includes(shift)
    );

    if (conflict) {

        return res.status(400).json({

            message:
            `Seat ${requestedSeat} is already occupied for selected shift(s).`

        });

    }

}
console.log("BODY =", req.body);
console.log("SEAT =", req.body.seatNumber);
console.log("SHIFTS =", req.body.shifts);
            const newStudent =
            new Student(studentData);
            console.log("REQ.FILES =", req.files);
console.log("AADHAAR FRONT =", req.files?.aadhaarFront);
console.log("AADHAAR BACK =", req.files?.aadhaarBack);
            await newStudent.save();

           
res.json({

    message:
    "Admission Submitted Successfully. Pending Verification.",
    receiptId

});
        }

        catch (error) {  console.error("========== ADMISSION ERROR ==========");
  console.error(error);
  console.error(error.stack);

  res.status(500).json({
    error: error.message
  });}

    }

);
app.get("/status/:receiptId", async (req, res) => {

    try {

        const student =
        await Student.findOne({

            receiptId:
            req.params.receiptId

        });

        if(!student){

            return res
            .status(404)
            .json({
                message:
                "Invalid Receipt ID"
            });

        }

        res.json(student);

    }

    catch(error){

        console.log(error);

        res
        .status(500)
        .send("Server Error");

    }

});

app.get("/students", async (req, res) => {

    try {

        const students =
        await Student.find();

        res.json(students);

    }

    catch (error) { console.error("ADMISSION ERROR:");
  console.error(error);
  console.error(error.stack);

  res.status(500).json({
    message: error.message,
    stack: error.stack
  });}

});

app.delete("/student/:id", async (req, res) => {

    try {

        await Student.findByIdAndDelete(
            req.params.id
        );

        res.send(
            "Student Deleted Successfully"
        );

    }

    catch(error){

        console.log(error);

        res
        .status(500)
        .send("Error Deleting Student");

    }

});

app.put("/student/approve/:id", async (req, res) => {

    try {

    const student = await Student.findById(
        req.params.id
    );
    console.log(student);
    console.log(Object.keys(student.toObject()));
    student.status = "Approved";
   console.log("Saving status:", student.status);

    await student.save();
const updatedStudent =
await Student.findById(req.params.id);

console.log(
    "Database status:",
    updatedStudent.status
);
    res.send(
        "Student Approved Successfully"
    );

}

    catch(error){

        console.log(error);

        res
        .status(500)
        .send("Error Approving Student");

    }

});
app.get("/status/:receiptId", async (req, res) => {

    try {

        const student = await Student.findOne({

            receiptId:
            req.params.receiptId

        });

        if(!student){

            return res
            .status(404)
            .json({

                message:
                "Invalid Receipt ID"

            });

        }

        res.json(student);

    }

    catch(error){

        console.log(error);


        res
        .status(500)
        .send("Server Error");

    }

});
app.get("/download/:receiptId", async (req, res) => {

    try {

        const student = await Student.findOne({

            receiptId:
            req.params.receiptId

        });

        if(!student){

            return res
            .status(404)
            .send("Student Not Found");

        }

        const fileName =
`${Date.now()}.pdf`;

const filePath =
path.join(
    __dirname,
    "pdfs",
    fileName
);

await generatePDF(
    student.toObject(),
    filePath
);

res.download(filePath);

setTimeout(() => {

    res.download(filePath);

}, 2000);

    }

    catch(error){

        console.log(error);

        res
        .status(500)
        .send("Server Error");

    }

});
const PORT = 
process.env.PORT || 5000; 
app.get('/export-students', async (req, res) => {
  try {
    const students = await Student.find().lean();

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=students.json'
    );

    res.setHeader('Content-Type', 'application/json');

    res.send(JSON.stringify(students, null, 2));
  } catch (err) {
    res.status(500).send(err.message);
  }
});
app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});