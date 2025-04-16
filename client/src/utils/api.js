import axios from 'axios';

const BACKEND_URL = "http://localhost:4000";

export const loadColumns = async (source, config, selectedTable, flatFile, delimiter) => {
  try {
    if (source === "flatfile" && flatFile) {
      const formData = new FormData();
      const { filename } = config;
      formData.append("file", flatFile);
      formData.append("delimiter", delimiter);
      formData.append("filename", filename);

      const response = await axios.post(`${BACKEND_URL}/flatfile/columns`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.columns;
    }
  } catch (error) {
    throw new Error("Error loading columns: " + error.message);
  }
};


export const previewData = async (source, flatFile, selectedColumns, delimiter) => {
  try {
    if (source === "flatfile" && flatFile) {
      const formData = new FormData();
      formData.append("file", flatFile);
      formData.append("delimiter", delimiter);
      formData.append("columns", JSON.stringify(selectedColumns));


      const response = await axios.post(`${BACKEND_URL}/flatfile/preview`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.preview;
    } else {
      throw new Error("Preview only supported for flat files.");
    }
  } catch (error) {
    throw new Error("Preview failed: " + error.message);
  }
};


export const startIngestion = async (source, config, flatFile) => {
  try {
    const formData = new FormData();

    formData.append("source", source);
    formData.append("config", JSON.stringify(config));

    if (source === "flatfile" && flatFile) {
      formData.append("flatFile", flatFile);
    }

    const response = await axios.post(`${BACKEND_URL}/ingest/ingest`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });


    return response;
  } catch (error) {
    console.log("erorr in ingestion")
    throw new Error("Ingestion failed: " + error.message);
  }
};


export const authenticate = async ( config ) => {
  try {
    const res = await axios.post(`${BACKEND_URL}/auth`, config);
    return res.data.token;
  } catch (error) {
    console.error("Authentication error:", error.message);
    throw new Error("Authentication failed");
  }
};

export const fetchClickHouseTables = async (config) => {
  const { host, port, database, user, token } = config;
  console.log(config);

  const response = await axios.post(`${BACKEND_URL}/clickhouse/tables`, {
    host,
    port,
    database,
    user,
    token
  });

  return response.data;
};

export const fetchClickHouseColumns = async (config, table) => {
  const { host, port, database, user, token } = config;

  const response = await axios.post(`${BACKEND_URL}/clickhouse/columns`, {
    host,
    port,
    database,
    user,
    token,
    table
  });

  return response.data;
};

export const fetchColumnDataFromApi = async (config, tableName, columnNames, limit = 10) => {
  const response = await axios.post(`${BACKEND_URL}/clickhouse/fetch-column-data`, {
    config,
    tableName,
    columnNames,
    limit
  });
  return response.data;
};