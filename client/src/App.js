import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import SourceSelector from "./components/SourceSelector";
import ConnectionForm from "./components/ConnectionForm";
import ColumnSelector from "./components/ColumnSelector";
import Toast from "./components/Toast";
import { handleLoadColumns, handlePreview } from './utils/ColumnHandler';
import { handleIngestion } from './utils/Ingestion';
import { authenticate } from './utils/api';

import "./index.css";
import "./App.css";

function App() {
  const [source, setSource] = useState("clickhouse");
  const [config, setConfig] = useState({
    host: "",
    port: "",
    database: "",
    user: "",
    password: "",
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStatus, setAuthStatus] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [clearPreviewSignal, setClearPreviewSignal] = useState(false);

  useEffect(() => {
    const savedConfig = Cookies.get("clickhouse_config");
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      setIsAuthenticated(true);
      setAuthStatus("Authenticated from saved config");
      showTemporaryToast("Authenticated from saved config");
    }
  }, []);

  const showTemporaryToast = (message) => {
    setStatus(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setStatus("");
    }, 2000);
  };

  const handleConnectionSubmit = async (e) => {
    e.preventDefault();
    const { host, port, database, user, password } = config;
    if (!host || !port || !database || !user || !password) {
      showTemporaryToast("All fields are required.");
      return;
    }

    try {
      const token = await authenticate(config);
      const updatedConfig = { ...config, token };
      setConfig(updatedConfig);
      Cookies.set("clickhouse_config", JSON.stringify(updatedConfig), { expires: 1 });
      setIsAuthenticated(true);
      showTemporaryToast("Authentication successful");
    } catch (err) {
      console.error("Auth failed:", err.message);
      showTemporaryToast("Authentication failed");
    }
  };

  const handleLogout = () => {
    Cookies.remove("clickhouse_config");
    setIsAuthenticated(false);
    setConfig({
      host: "",
      port: "",
      database: "",
      user: "",
      password: "",
      token: "",
      filename: "",
      delimiter: ",",
    });
    showTemporaryToast("Logged out");
  };

  const handleLoadColumnsWrapper = () => {
    handleLoadColumns(source, config, selectedTable, flatFile, config.delimiter, setColumns);
  };

  const handlePreviewWrapper = () => {
    handlePreview(source, flatFile, selectedColumns, config.delimiter);
  };

  const handleIngestionWrapper = () => {
    handleIngestion(source, config, flatFile, (ingestionStatus) => {
      showTemporaryToast(ingestionStatus);
      setFlatFile(null);
      setConfig(prev => ({ ...prev, filename: "" }));
      setClearPreviewSignal(true);
      setTimeout(() => setClearPreviewSignal(false), 0);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 relative">
      {/* Toast */}
      {showToast && (
        <Toast
          message={status}
          type={status.includes("failed") ? "error" : "success"}
        />
      )}

      {/* Logout icon in top right */}
      {isAuthenticated && (
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 text-gray-800 hover:text-red-800 transition duration-150"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </button>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-black-600 mb-6">
          Bidirectional Data Ingestion Tool
        </h1>

        {!isAuthenticated ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleConnectionSubmit}>
              <ConnectionForm
                source={source}
                config={config}
                setConfig={setConfig}
                setFlatFile={setFlatFile}
              />
              <div className="mt-4 text-center">
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900"
                >
                  Connect and Get Token
                </button>

              </div>
            </form>
          </div>
        ) : (
          <>
            <SourceSelector source={source} setSource={setSource} />
            <ConnectionForm
              source={source}
              config={config}
              setConfig={setConfig}
              setFlatFile={setFlatFile}
              isAuthenticated={isAuthenticated}
              clearPreviewSignal={clearPreviewSignal}
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
              onIngestion={handleIngestionWrapper}
              config={config}
            />
            {source === "flatfile" && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleIngestionWrapper}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Ingest Data
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;