require("dotenv").config();

const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const path = require("path");

const multer = require("multer");

const Student = require("./models/Student");
const CoachingStudent = require("./models/CoachingStudent");
const Admin = require("./models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateAdmin = require("./middleware/authMiddleware");
const SeatManager = require("./services/SeatManager");
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


.then(async () => {

    console.log("MongoDB Connected");

    await SeatManager.loadFromDatabase();

    console.log("Seat occupancy cache initialized");

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
        const excludeStudentId = req.query.excludeStudentId;

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

        // Read current occupancy from in-memory cache
        const occupancyMap = new Map(
            SeatManager.getOccupancyMap()
        );

        // Preserve exclude-student behavior for admin seat editing
        if (excludeStudentId) {
            const excludedStudent = await Student.findById(
                excludeStudentId
            )
                .select("seatNumber shifts")
                .lean();

            if (excludedStudent?.seatNumber) {
                const excludedSeat = Number(
                    excludedStudent.seatNumber
                );

                const excludedShifts = normalizeShifts(
                    excludedStudent.shifts
                );

                const seatShifts = occupancyMap.get(
                    excludedSeat
                ) || [];

                const remainingShifts = seatShifts.filter(
                    (shift) =>
                        !excludedShifts.includes(shift)
                );

                if (remainingShifts.length > 0) {
                    occupancyMap.set(
                        excludedSeat,
                        remainingShifts
                    );
                } else {
                    occupancyMap.delete(excludedSeat);
                }
            }
        }

        const occupiedSeats = new Set();

        occupancyMap.forEach((shifts, seatNumber) => {
            if (checkConflict(shifts, requestedShifts)) {
                occupiedSeats.add(Number(seatNumber));
            }
        });

        const availableSeats = [];
        for (let i = 1; i <= 65; i++) {
            if (!occupiedSeats.has(i)) {
                availableSeats.push(i);
            }
        }

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

app.post(

    "/coaching-admission",

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
            // PHASE 1: VALIDATE REQUIRED FIELDS
            // ==========================================

            if (!req.body.fullName) {
                return res.status(400).json({
                    message: "Full Name is required"
                });
            }

            if (!req.body.course) {
                return res.status(400).json({
                    message: "Course selection is required"
                });
            }

            const validCourses = [
                "ADCA", "DCA", "PGDCA", "CCC",
                "Basic Computer", "Tally Prime",
                "Advanced Excel", "MS Office", "Typing"
            ];

            if (!validCourses.includes(req.body.course)) {
                return res.status(400).json({
                    message: "Invalid course selection"
                });
            }

            // ==========================================
            // PHASE 2: PREPARE AND SAVE STUDENT DATA
            // ==========================================

            // Generate receipt ID (same format as library)
            const receiptId =
                "JHRC-" + Date.now().toString().slice(-6);

            // Build student document with file uploads
            const studentData = {
                ...req.body,
                receiptId,
                status: "Pending",
                aadhaarFront:
                    req.files?.aadhaarFront?.[0]?.path || "",
                aadhaarBack: req.files?.aadhaarBack?.[0]?.path || "",
            };

            // Create and save new coaching student record
            const newCoachingStudent = new CoachingStudent(studentData);
            await newCoachingStudent.save();

            // ==========================================
            // PHASE 3: RETURN SUCCESS RESPONSE
            // ==========================================

            res.json({
                message:
                    "Enrollment Submitted Successfully. Pending Verification.",
                receiptId,
            });
        } catch (error) {
            console.error(
                "========== COACHING ADMISSION ERROR =========="
            );
            console.error(error);
            console.error(error.stack);

            res.status(500).json({
                error: error.message,
            });
        }
    }

);

// ========== COACHING STUDENT ENDPOINTS ==========

app.get("/coaching-students", async (req, res) => {

    try {

        const status = req.query.status || null;

        let query = {};

        if (status) {
            query.status = status;
        }

        const coachingStudents = await CoachingStudent.find(query);

        res.json(coachingStudents);

    }

    catch (error) {
        console.error("COACHING STUDENTS FETCH ERROR:");
        console.error(error);
        res.status(500).json({
            message: error.message
        });
    }

});

app.put("/coaching-student/approve/:id", async (req, res) => {

    try {

        const coachingStudent = await CoachingStudent.findById(req.params.id);

        if (!coachingStudent) {
            return res.status(404).json({
                message: "Coaching student not found"
            });
        }

        coachingStudent.status = "Approved";

        await coachingStudent.save();

        res.json({
            message: "Coaching Student Approved Successfully",
            student: coachingStudent
        });

    }

    catch (error) {
        console.error("COACHING APPROVE ERROR:");
        console.error(error);
        res.status(500).json({
            message: "Error Approving Coaching Student"
        });
    }

});

app.put("/coaching-student/reject/:id", async (req, res) => {

    try {

        const coachingStudent = await CoachingStudent.findById(req.params.id);

        if (!coachingStudent) {
            return res.status(404).json({
                message: "Coaching student not found"
            });
        }

        coachingStudent.status = "Rejected";

        await coachingStudent.save();

        res.json({
            message: "Coaching Student Rejected Successfully",
            student: coachingStudent
        });

    }

    catch (error) {
        console.error("COACHING REJECT ERROR:");
        console.error(error);
        res.status(500).json({
            message: "Error Rejecting Coaching Student"
        });
    }

});

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

        await SeatManager.loadFromDatabase();

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

app.put("/student/:id/seat", async (req, res) => {

    try {

        const student = await Student.findById(
            req.params.id
        );

        if(!student){

            return res
            .status(404)
            .json({
                message: "Student not found"
            });

        }

        const seatValidation = validateSeatNumber(
            req.body.seatNumber
        );

        if (!seatValidation.isValid) {

            return res
            .status(400)
            .json({
                message: seatValidation.error
            });

        }

        const shiftsValidation = validateShifts(
            req.body.shifts
        );

        if (!shiftsValidation.isValid) {

            return res
            .status(400)
            .json({
                message: shiftsValidation.error
            });

        }

        const requestedSeat = Number(
            req.body.seatNumber
        );

        const requestedShifts =
        shiftsValidation.shifts;

        const existingStudents = await Student.find({
            seatNumber: requestedSeat,
            _id: {
                $ne: req.params.id
            }
        });

        const conflictResult = checkConflicts(
            existingStudents,
            requestedShifts
        );

        if (conflictResult.hasConflict) {

            return res
            .status(400)
            .json({
                message: `Seat ${requestedSeat} is already occupied for selected shift(s).`
            });

        }

        student.seatNumber = requestedSeat;
        student.shifts = requestedShifts;

        await student.save();

        await SeatManager.loadFromDatabase();

        res.json({
            message: "Seat assignment updated successfully",
            student
        });

    }

    catch(error){

        console.log(error);

        res
        .status(500)
        .json({
            message: "Error updating seat assignment"
        });

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

await SeatManager.loadFromDatabase();

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

        const receiptId = req.params.receiptId;
        let student = null;
        let module = "library";

        // First check if it's a Library receipt
        student = await Student.findOne({ receiptId });

        // If not found in Library, check Coaching collection
        if (!student) {
            student = await CoachingStudent.findOne({ receiptId });
            if (student) {
                module = "coaching";
            }
        }

        if(!student){

            return res
            .status(404)
            .send("Receipt Not Found");

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
    filePath,
    module
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

// ==========================================
// ADMIN LOGIN ENDPOINT - TEST INSTRUCTIONS
// ==========================================
//
// ENDPOINT: POST /admin/login
//
// PURPOSE: Authenticate admin users by username and password
//
// REQUEST FORMAT (JSON):
// {
//     "username": "jhrcadmin",
//     "password": "YOUR_ADMIN_PASSWORD"
// }
//
// HOW TO TEST WITH POSTMAN:
//
// 1. Open Postman
// 2. Click "Create a new request" or use the + tab
// 3. Set Method: POST
// 4. Set URL: http://localhost:5000/admin/login
//    (or https://jhrc.onrender.com/admin/login for production)
// 5. Go to "Body" tab
// 6. Select "raw"
// 7. Change format to JSON (dropdown on the right)
// 8. Paste:
//    {
//        "username": "jhrcadmin",
//        "password": "YOUR_ADMIN_PASSWORD"
//    }
// 9. Click "Send"
//
// EXPECTED RESPONSES:
//
// SUCCESS (HTTP 200):
// {
//     "success": true,
//     "message": "Login successful"
// }
//
// MISSING USERNAME OR PASSWORD (HTTP 400):
// {
//     "success": false,
//     "message": "Username and password are required"
// }
//
// INVALID USERNAME OR PASSWORD (HTTP 401):
// {
//     "success": false,
//     "message": "Invalid username or password"
// }
//
// SERVER ERROR (HTTP 500):
// {
//     "success": false,
//     "message": "Server error"
// }
//
// NOTES:
// - This endpoint does NOT return JWT tokens yet
// - The lastLogin timestamp is automatically updated on successful login
// - Passwords are hashed using bcrypt and never stored in plain text
// - Use the exact password provided during admin creation (createAdmin.js)
//
// ==========================================

app.post("/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }

        // Find admin by username
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Compare password using bcrypt
        const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }

        // Update last login timestamp
        admin.lastLogin = new Date();
        await admin.save();

        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "JWT configuration error"
            });
        }

        // Generate JWT token (24 hours expiry)
        const token = jwt.sign(
            {
                adminId: admin._id,
                username: admin.username,
                role: admin.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ==========================================
// ADMIN PROFILE ROUTE - TEST AUTHENTICATION
// ==========================================

app.get("/admin/profile", authenticateAdmin, (req, res) => {
    return res.status(200).json({
        success: true,
        admin: req.admin
    });
});

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});