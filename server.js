const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.static("public"));

// Configure upload (only images, max 5MB)
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  }
});

// View metadata
app.post("/metadata", upload.single("image"), (req, res) => {
  const filepath = req.file.path;

  exec(`exiftool "${filepath}"`, (err, stdout) => {
    if (err) {
      return res.status(500).send("Error reading metadata");
    }
    res.send(stdout);
  });
});

// Remove metadata
app.post("/remove", upload.single("image"), (req, res) => {
  const filepath = req.file.path;

  exec(`exiftool -all= -overwrite_original "${filepath}"`, (err) => {
    if (err) {
      return res.status(500).send("Error removing metadata");
    }
    res.download(filepath, "cleaned_image.jpg");
  });
});

// Serve website
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
