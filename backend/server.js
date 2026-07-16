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

// Import seat allocation utilities for conflict detection
const {
    normalizeShifts,
    checkConflict,
    calculateAvailableSeats,
    validateSeatNumber,
    validateShifts,
    checkConflicts,
} = require("./utils/seatAllocation");

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
app.get("/test-route", (req, res) => {
    res.send("TEST ROUTE WORKING");
});
app.get("/", (req, res) => {

    res.send("Library Backend Running Successfully");

});
 app.get("/seat-status", (req, res) => {

    res.sendFile(
       path.join(__dirname, "..", "seat-status.html")
    );

});
app.get("/api/seat-status", async (req, res) => {
   

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
/**
 * GET /available-seats
 * 
 * Returns list of available seats for the requested shifts.
 * Implements algorithm from AGENTS.md Seat Allocation System.
 * 
 * ALGORITHM:
 * 1. Parse requested shifts from query parameter
 * 2. If no shifts specified, all 65 seats are available
 * 3. Normalize shifts (expand FULL → [S1, S2, S3, S4])
 * 4. Get all students from database
 * 5. Calculate which seats conflict with requested shifts
 * 6. Return seats that don't have conflicts
 * 
 * QUERY PARAMETERS:
 * - shifts: comma-separated shift codes (S1,S2,S3,S4,FULL)
 *   Example: ?shifts=S1,S2  returns seats available for S1 or S2
 *   If omitted, all 65 seats returned
 * 
 * RESPONSE:
 * { availableSeats: [1, 2, 3, ...] }
 */
app.get("/available-seats", async (req, res) => {
    try {
        let requestedShifts = req.query.shifts;

        // If no shifts specified, all 65 seats are available
        if (!requestedShifts) {
            return res.json({
                availableSeats: Array.from(
                    { length: 65 },
                    (_, i) => i + 1
                ),
            });
        }

        // Parse comma-separated shifts from query string
        requestedShifts = requestedShifts.split(",");

        // Normalize shifts (expand FULL to [S1, S2, S3, S4])
        requestedShifts = normalizeShifts(requestedShifts);

        // Get all students from database
        const students = await Student.find();

        // Calculate available seats using shared utility function
        const { availableSeats } = calculateAvailableSeats(
            students,
            requestedShifts
        );

        res.json({ availableSeats });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error",
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
            // ==========================================
            // PHASE 1: VALIDATE INPUT
            // ==========================================

            // Validate seat number is in range 1-65
            const seatValidation = validateSeatNumber(
                req.body.seatNumber
            );
            if (!seatValidation.isValid) {
                return res.status(400).json({
                    message: seatValidation.error,
                });
            }
            const requestedSeat = Number(req.body.seatNumber);

            // Validate shifts are valid and non-empty
            const shiftsValidation = validateShifts(req.body.shifts);
            if (!shiftsValidation.isValid) {
                return res.status(400).json({
                    message: shiftsValidation.error,
                });
            }
            const requestedShifts = shiftsValidation.shifts;

            // ==========================================
            // PHASE 2: CHECK FOR SEAT/SHIFT CONFLICTS
            // ==========================================

            // Find all existing students in requested seat
            const existingStudents = await Student.find({
                seatNumber: requestedSeat,
            });

            // Check if any existing student has conflicting shifts
            const conflictResult = checkConflicts(
                existingStudents,
                requestedShifts
            );

            if (conflictResult.hasConflict) {
                return res.status(400).json({
                    message: `Seat ${requestedSeat} is already occupied for selected shift(s).`,
                });
            }

            // ==========================================
            // PHASE 3: PREPARE AND SAVE STUDENT DATA
            // ==========================================

            // Generate receipt ID
            const receiptId =
                "JHRC-" + Date.now().toString().slice(-6);

            // Build student document with file uploads
            const studentData = {
                ...req.body,
                receiptId,
                shifts: requestedShifts, // Use validated/normalized shifts
                aadhaarFront:
                    req.files?.aadhaarFront?.[0]?.path || "",
                aadhaarBack: req.files?.aadhaarBack?.[0]?.path || "",
            };

            // Create and save new student record
            const newStudent = new Student(studentData);
            await newStudent.save();

            // ==========================================
            // PHASE 4: RETURN SUCCESS RESPONSE
            // ==========================================

            res.json({
                message:
                    "Admission Submitted Successfully. Pending Verification.",
                receiptId,
            });
        } catch (error) {
            console.error(
                "========== ADMISSION ERROR =========="
            );
            console.error(error);
            console.error(error.stack);

            res.status(500).json({
                error: error.message,
            });
        }
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