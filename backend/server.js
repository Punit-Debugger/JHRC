const express = require("express");

const cors = require("cors");

const mongoose = require("mongoose");

const Student = require("./models/Student");

const app = express();

app.use(cors());

app.use(express.json());

mongoose.connect(
    "mongodb://jhrc:jhrc123@ac-6lklyss-shard-00-00.wxbi70v.mongodb.net:27017,ac-6lklyss-shard-00-01.wxbi70v.mongodb.net:27017,ac-6lklyss-shard-00-02.wxbi70v.mongodb.net:27017/?ssl=true&replicaSet=atlas-f66n7y-shard-0&authSource=admin&appName=Cluster0"
)

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

    try{

        const student = new Student(req.body);

        await student.save();

        console.log(req.body);

        res.send("Admission Saved Successfully");

    }

    catch(error){

        console.log(error);

        res.status(500).send("Error Saving Admission");

    }

});

app.listen(5000, () => {

    console.log("Server running on port 5000");

});