const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();  // Ensure this is loaded at the top




// Middleware FIRST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// Then routes
const userRoutes = require("./src/routes/users");
app.use("/api/users", userRoutes);


// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Added in .env
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary credentials are missing
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("Cloudinary credentials are missing from the environment variables.");
  process.exit(1);  // Exit the app if credentials are missing
}

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce_uploads",  // Optional folder for your uploaded images
    allowed_formats: ["jpg", "png", "jpeg"],  // Allow only these image formats
  },
});

const upload = multer({ storage });

// DB Connection (MongoDB) - Removed deprecated options
mongoose.connect("mongodb+srv://admin:admin@cluster0.joc8yyj.mongodb.net/E-commerce?retryWrites=true&w=majority")
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

// Test Route
app.get("/", (req, res) => {
  res.send("API is working fine!");
});



// Upload Route
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  // Send back the URL of the uploaded image in Cloudinary
  res.json({
    success: 1,
    image_url: req.file.path,  // Cloudinary automatically provides the URL
  });
});




// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start Server
const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
