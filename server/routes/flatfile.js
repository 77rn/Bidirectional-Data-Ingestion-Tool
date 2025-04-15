const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {

    const originalName = file.originalname;
    const baseName = path.parse(originalName).name;
    cb(null, `${baseName}.csv`);
  }
});

const upload = multer({ storage });

router.post("/columns", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const columns = new Set();

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("headers", (headers) => {
      headers.forEach((h) => columns.add(h));
    })
    .on("end", () => {
      fs.unlinkSync(filePath);
      res.json({ columns: Array.from(columns) });
    })
    .on("error", (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: err.message });
    });
});

router.post("/preview", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  const previewRows = [];

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      if (previewRows.length < 100) {
        previewRows.push(row);
      }
    })
    .on("end", () => {
      fs.unlinkSync(filePath);
      res.json({ preview: previewRows });
    })
    .on("error", (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ error: err.message });
    });
});

module.exports = router;