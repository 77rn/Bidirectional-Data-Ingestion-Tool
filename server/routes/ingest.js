require("dotenv").config();
const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const { ingestClickHouse } = require("../utils/ingestClickHouse");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/ingest", upload.single("flatFile"), async (req, res) => {
  try {
    const source = req.body.source;
    const config = JSON.parse(req.body.config);
    const { host, port, database, delimiter, token, filename } = config;

    const decoded = jwt.verify(token, JWT_SECRET);
    const { username, password } = decoded;

    const flatFilePath = req.file.path;
    const selectedTable = filename;

    if (source === 'flatfile') {
      const result = await ingestClickHouse({
        host,
        port,
        database,
        user: username,
        password,
        flatFilePath,
        delimiter,
        selectedTable,
      });


      return res.status(200).json(result);
    }

    res.status(400).json({ error: "Unknown source type" });
  } catch (error) {
    console.error("Ingestion error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;