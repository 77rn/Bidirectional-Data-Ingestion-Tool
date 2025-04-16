const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const flatfileRoutes = require("./routes/flatfile");
const ingestRoutes = require('./routes/ingest');
const authRoute = require('./routes/auth');
const clickhouseRoutes = require('./routes/clickhouse')

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/flatfile", flatfileRoutes);
app.use("/ingest", ingestRoutes);
app.use("/auth", authRoute);
app.use("/clickhouse", clickhouseRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));