import React, { useState, useEffect } from "react";
import SourceSelector from "./components/SourceSelector";
import ConnectionForm from "./components/ConnectionForm";
import ColumnSelector from "./components/ColumnSelector";
import { handleLoadColumns, handlePreview } from './utils/ColumnHandler';
import { handleIngestion } from './utils/Ingestion';
import { authenticate } from './utils/api';

import "./index.css";
import "./App.css";

function App() {
  const [source, setSource] = useState("clickhouse");
  const [config, setConfig] = useState({
    host: "https://bkweb86blv.ap-south-1.aws.clickhouse.cloud",
    port: "8443",
    database: "default",
    user: "default",
    token: "",
    filename: "",
    delimiter: ",",
  });

  const [flatFile, setFlatFile] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [status, setStatus] = useState("");
  const [authStatus, setAuthStatus] = useState("Authenticating...");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await authenticate();
        setConfig(prev => ({ ...prev, token }));
        setAuthStatus("Authentication successful");
      } catch (err) {
        console.error("Auth failed:", err.message);
        setAuthStatus("Authentication failed");
      }
    };

    fetchToken();
  }, []);


  useEffect(() => {
    const fetchFlatFileName = async () => {
      try {
        if (flatFile?.name) {
          const filename = flatFile.name.split(".")[0];
          setConfig(prev => ({ ...prev, filename }));
        }
        console.log(selectedColumns);
        console.log(columns);
      } catch (err) {
        console.error("Flat File Name Fetching Failed");
      }
    };

    fetchFlatFileName();
  }, [flatFile]);

  const handleLoadColumnsWrapper = () => {
    handleLoadColumns(source, config, selectedTable, flatFile, config.delimiter, setColumns);
  };

  const handlePreviewWrapper = () => {
    handlePreview(source, flatFile, selectedColumns, config.delimiter);
  };

  const handleIngestionWrapper = () => {
    handleIngestion(source, config, flatFile, setStatus);
  };

  if (authStatus !== "Authentication successful") {
    return (
      <div className="h-screen flex items-center justify-center text-lg text-gray-700">
        {authStatus}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Bidirectional Data Ingestion Tool
        </h1>

        <SourceSelector source={source} setSource={setSource} />
        <ConnectionForm
          source={source}
          config={config}
          setConfig={setConfig}
          setFlatFile={setFlatFile}
        />
        <ColumnSelector
          source={source}
          tables={tables}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          columns={columns}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          onLoadColumns={handleLoadColumnsWrapper}
          onPreview={handlePreviewWrapper}
        />

        <div className="mt-6 text-center">
          <button
            onClick={handleIngestionWrapper}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Start Ingestion
          </button>
        </div>

        <div className="mt-4 text-center">
          {status && (
            <p className={`text-lg ${status.includes("failed") ? "text-red-600" : "text-green-600"}`}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
