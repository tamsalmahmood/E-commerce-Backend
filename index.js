const port = 8000;
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const {Product}  = require("./src/models/customer");

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect("mongodb+srv://admin:admin@cluster0.joc8yyj.mongodb.net/E-commerce?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});


// Import Routes 
const userRoutes = require("./src/routes/user");
app.use("/api", userRoutes); // Prefix API routes

// Default Route
app.get("/", (req, res) => {
    res.send("MongoDB connected with Express.js");
});

// Image Storage Engine
const storage = multer.diskStorage({
    destination: "./upload/images",
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Serve Images
app.use("/images", express.static("upload/images"));

// Upload Route
app.post("/upload", upload.single("product"), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`,
    });
});


// Start Server
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error: " + error);
    }
});
