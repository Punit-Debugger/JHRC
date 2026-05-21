require("dotenv").config();

const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const path = require("path");

const Student = require("./models/Student");

const generatePDF = require("./generatePDF");

const app = express();

app.use(cors());

app.use(express.json());

app.use(
    "/pdfs",
    express.static(
        path.join(process.cwd(), "pdfs")
    )
);

mongoose.connect(process.env.MONGO_URI)

.then(() => {

    console.log("MongoDB Connected");

})

.catch((error) => {

    console.log(error);

});

app.get("/", (req, res) => {

    res.send("Library Backend Running Successfully");

});

app.post("/admission", async (req, res) => {

    try {

        const newStudent = new Student(req.body);

        await newStudent.save();

        const fileName =
        `${Date.now()}.pdf`;

        const filePath =
        path.join(
            process.cwd(),
            "pdfs",
            fileName
        );

        generatePDF(req.body, filePath);

        res.json({

            message: "Admission Saved Successfully",

            pdfUrl:
            `https://jhrc.onrender.com/pdfs/${fileName}`

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Error Saving Admission");

    }

});

app.get("/students", async (req, res) => {

    try {

        const students = await Student.find();

        res.json(students);

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Error Fetching Students");

    }

});

app.delete("/student/:id", async (req, res) => {

    try {

        await Student.findByIdAndDelete(req.params.id);

        res.send("Student Deleted Successfully");

    }

    catch(error){

        console.log(error);

        res.status(500).send("Error Deleting Student");

    }

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});