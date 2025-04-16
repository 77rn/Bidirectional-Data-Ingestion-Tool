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
  const [authStatus, setAuthStatus] = useState("Please enter your ClickHouse details");
  const [showStatus, setShowStatus] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleConnectionSubmit = async (e) => {
    e.preventDefault();
    const { host, port, database, user, password } = config;
    console.log(config);

    if (!host || !port || !database || !user || !password) {
      setAuthStatus("All fields are required.");
      return;
    }

    try {
      const token = await authenticate(config);
      setConfig(prev => ({ ...prev, token }));
      setAuthStatus("Authentication successful");
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Auth failed:", err.message);
      setAuthStatus("Authentication failed");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
    }
  }, [isAuthenticated]);

  const handleLoadColumnsWrapper = () => {
    handleLoadColumns(source, config, selectedTable, flatFile, config.delimiter, setColumns);
  };

  const handlePreviewWrapper = () => {
    handlePreview(source, flatFile, selectedColumns, config.delimiter);
  };

  const handleIngestionWrapper = () => {
    handleIngestion(source, config, flatFile, (ingestionStatus) => {
      setStatus(ingestionStatus);
      setShowStatus(true);
    });
  };

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Bidirectional Data Ingestion Tool
        </h1>

        {!isAuthenticated && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Enter ClickHouse Connection Details</h2>
            <form onSubmit={handleConnectionSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="host" className="block text-sm font-medium text-gray-700">Host</label>
                  <input
                    type="text"
                    id="host"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    value={config.host}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="port" className="block text-sm font-medium text-gray-700">Port</label>
                  <input
                    type="text"
                    id="port"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="database" className="block text-sm font-medium text-gray-700">Database</label>
                  <input
                    type="text"
                    id="database"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    value={config.database}
                    onChange={(e) => setConfig({ ...config, database: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="user" className="block text-sm font-medium text-gray-700">User</label>
                  <input
                    type="text"
                    id="user"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    value={config.user}
                    onChange={(e) => setConfig({ ...config, user: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"
                    value={config.password}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                    required
                  />
                </div>
                <div className="mt-4 text-center">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Connect and Get Token
                  </button>
                </div>
              </div>
            </form>
            <div className="mt-4 text-center text-red-600">{authStatus}</div>
          </div>
        )}

        {isAuthenticated && (
          <>
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
              onIngestion={handleIngestionWrapper}
              config={config}
            />

            {source === "flatfile" && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleIngestionWrapper}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Ingest Data
                </button>
              </div>
            )}

            <div className="mt-4 text-center">
              {showStatus && status && (
                <p className={`text-lg ${status.includes("failed") ? "text-red-600" : "text-green-600"}`}>
                  {status}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;