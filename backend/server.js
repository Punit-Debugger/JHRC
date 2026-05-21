require("dotenv").config();

const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const Student = require("./models/Student");

const app = express();

app.use(cors());

app.use(express.json());

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

        res.send("Admission Saved Successfully");

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});