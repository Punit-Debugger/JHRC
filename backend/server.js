require("dotenv").config();

const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const path = require("path");

const multer = require("multer");

const Student = require("./models/Student");

const generatePDF = require("./generatePDF");

const app = express();

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

mongoose.connect(
    "mongodb://127.0.0.1:27017/libraryDB"
)

.then(() => {

    console.log("MongoDB Connected");

})

.catch((error) => {

    console.log(error);

});

const storage = multer.diskStorage({

    destination: function(req, file, cb){

        cb(
            null,
            path.join(__dirname, "uploads")
        );

    },

    filename: function(req, file, cb){
__dirname
        const uniqueName =
        Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});

const upload = multer({

    storage: storage

});

app.get("/", (req, res) => {

    res.send("Library Backend Running Successfully");

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

            const studentData = {

                ...req.body,

                aadhaarFront:
                req.files.aadhaarFront
                ? req.files.aadhaarFront[0].filename
                : "",

                aadhaarBack:
                req.files.aadhaarBack
                ? req.files.aadhaarBack[0].filename
                : ""

            };

            const newStudent =
            new Student(studentData);

            await newStudent.save();

            const fileName =
            `${Date.now()}.pdf`;

            const filePath =
            path.join(
                __dirname,
                "pdfs",
                fileName
            );

          try {

    generatePDF(studentData, filePath);
await new Promise(resolve =>
    setTimeout(resolve, 2000)
);
    console.log("PDF Generated");

}

catch(error){

    console.log("PDF ERROR:");
    console.log(error);

}

            res.json({

    message:
    "Admission Saved Successfully",

    pdfUrl:
    `http://localhost:5000/pdfs/${fileName}`

});

        }

        catch (error) {

            console.log(error);

            res
            .status(500)
            .send("Error Saving Admission");

        }

    }

);

app.get("/students", async (req, res) => {

    try {

        const students =
        await Student.find();

        res.json(students);

    }

    catch (error) {

        console.log(error);

        res
        .status(500)
        .send("Error Fetching Students");

    }

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

const PORT =
process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});