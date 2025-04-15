const fs = require("fs");
const path = require("path");
const { getClickHouseClient } = require("./clickhouseclient");

const ingestClickHouse = async ({
  host,
  port,
  database,
  user,
  password,
  flatFilePath,
  delimiter,
  selectedTable
}) => {
  try {
    const client = getClickHouseClient(host, port, user, password);
    const fileContent = fs.readFileSync(flatFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');

    if (lines.length === 0) {
      throw new Error("Flat file is empty");
    }

    const selectedColumns = lines[0].split(delimiter).map(col => col.trim());

    const createQuery = `
      CREATE TABLE IF NOT EXISTS ${database}.${selectedTable}
      (${selectedColumns.map(col => `\`${col}\` String`).join(", ")})
      ORDER BY tuple()
    `;

    await client.exec({
      query: createQuery,
      clickhouse_settings: {
        wait_end_of_query: 1,
      },
    });


    const rows = lines.slice(1).map(line => {
      const values = line.split(delimiter);
      const rowObj = {};
      selectedColumns.forEach((col, index) => {
        rowObj[col] = values[index] ?? "";
      });
      return rowObj;
    });

    await client.insert({
      table: `${database}.${selectedTable}`,
      values: rows,
      format: 'JSONEachRow',
    });

    return {
      status: "success",
      message: `Ingested ${rows.length} rows into ${database}.${selectedTable}`
    };
  } catch (error) {
    console.error("ClickHouse ingestion failed:", error);
    throw new Error(`Ingestion failed: ${error.message}`);
  }
};

module.exports = { ingestClickHouse };