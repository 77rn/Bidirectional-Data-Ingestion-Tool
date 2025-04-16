require('dotenv').config();
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getClickHouseClient } = require("../utils/clickhouseclient");

const JWT_SECRET = process.env.JWT_SECRET;
router.post("/tables", async (req, res) => {
    const { host, port, database, token } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { username, password } = decoded;
        const client = getClickHouseClient(host, port, username, password);
        const result = await client
            .query({
                query: `SHOW TABLES FROM ${database}`,
                format: "JSONEachRow",
            })
            .then((response) => response.json());

        const tables = result.map(row => Object.values(row)[0]);
        res.json({ tables });
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ error: "Failed to fetch tables" });
    }
});

router.post("/columns", async (req, res) => {
    const { host, port, database, table, token } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { username, password } = decoded;
        const client = getClickHouseClient(host, port, username, password);
        const result = await client
            .query({
                query: `DESCRIBE TABLE ${database}.${table}`,
                format: "JSONEachRow",
            })
            .then((response) => response.json());

        const columns = result.map(row => row.name);
        res.json({ columns });
    } catch (error) {
        console.error("Error fetching columns:", error);
        res.status(500).json({ error: "Failed to fetch columns" });
    }
});

router.post("/fetch-column-data", async (req, res) => {
    const { config, tableName, columnNames, limit = 10 } = req.body;
    const { host, port, database, token } = config;
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const { username, password } = decoded;
  
      const client = getClickHouseClient(host, port, username, password);

      const safeColumns = columnNames.map(col => `\`${col}\``).join(", ");
      const query = `SELECT ${safeColumns} FROM \`${database}\`.\`${tableName}\` LIMIT ${limit}`;
  
      const resultSet = await client.query({
        query,
        format: "JSONEachRow"
      });


  
      const data = await resultSet.json();
      res.status(200).json({ data });
  
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });
  

module.exports = router;