import React, { useEffect, useState } from "react";
import { fetchColumnsFromBackend, fetchTablesFromBackend, debouncedFetchColumnData } from "../utils/ColumnHandler";

const ColumnSelector = ({ source, config, onPreview, onIngestion }) => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Row fetch mode
  const [rowMode, setRowMode] = useState("all");
  const [rowLimit, setRowLimit] = useState(10);

  useEffect(() => {
    const fetchTables = async () => {
      if (source === "clickhouse" && config?.database) {
        try {
          const tablesData = await fetchTablesFromBackend(config);
          setTables(tablesData);
        } catch (error) {
          console.error("Error fetching tables:", error.message);
        }
      }
    };
    fetchTables();
  }, [source, config]);

  useEffect(() => {
    const fetchColumns = async () => {
      if (selectedTable && source === "clickhouse" && config?.database) {
        try {
          const columnsData = await fetchColumnsFromBackend(config, selectedTable);
          setColumns(columnsData);
          setSelectedColumns([]);
          setPreviewData([]);
        } catch (error) {
          console.error("Error fetching columns:", error.message);
        }
      }
    };

    if (selectedTable) fetchColumns();
  }, [selectedTable, source, config]);

  useEffect(() => {
    if (selectedTable && selectedColumns.length > 0 && source === "clickhouse") {
      setIsLoading(true);
      const limit = rowMode === "limit" ? rowLimit : undefined;
      debouncedFetchColumnData(config, selectedTable, selectedColumns, (response) => {
        const cleanData = response.data.map((row) =>
          Object.fromEntries(
            Object.entries(row).map(([key, value]) => [key, String(value).replace(/^"|"$/g, "")])
          )
        );
        setPreviewData(cleanData);
        setIsLoading(false);
      }, limit);
    } else {
      setPreviewData([]);
    }
  }, [selectedColumns, selectedTable, config, source, rowMode, rowLimit]);

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
  };

  const toggleColumn = (col) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter((c) => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(columns);
    }
    setSelectAll(!selectAll);
  };

  const downloadCSV = () => {
    if (!previewData.length) return;

    const csvHeaders = selectedColumns.join(",");
    const csvRows = previewData.map((row) =>
      selectedColumns.map((col) => `"${(row[col] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = [csvHeaders, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedTable}_preview.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {source === "clickhouse" && (
        <div className="p-6 mt-6 border border-gray-300 rounded-xl shadow-md bg-white">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Control Panel</h2>

          {/* Table Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Table</label>
            <select
              value={selectedTable}
              onChange={handleTableChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="" disabled>Select a table</option>
              {tables.map((table, idx) => (
                <option key={idx} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>

          {/* Row Limit Option */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium text-gray-700">Row Fetch Mode:</label>
            <select
              value={rowMode}
              onChange={(e) => setRowMode(e.target.value)}
              className="p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Rows</option>
              <option value="limit">Limit</option>
            </select>

            {rowMode === "limit" && (
              <input
                type="number"
                value={rowLimit}
                onChange={(e) => setRowLimit(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-md w-24"
                min="1"
              />
            )}
          </div>

          {/* Column Selection */}
          {columns.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Columns</label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                <label className="flex items-center gap-2 mb-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="accent-blue-600"
                  />
                  Select All
                </label>
                {columns.map((col, idx) => (
                  <label key={idx} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                      className="accent-blue-600"
                    />
                    <span className="text-gray-700">{col}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mb-4">

            <button
              onClick={downloadCSV}
              disabled={previewData.length === 0}
              className={`px-4 py-2 ${
                previewData.length === 0 ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              } text-white rounded-md transition`}
            >
              Download as CSV
            </button>
          </div>

          {/* Preview Table */}
          {selectedColumns.length > 0 && (
            <div className="mt-6 max-h-72 overflow-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Selected Columns Preview
                {isLoading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
              </h3>

              <div className="overflow-auto border border-gray-300 rounded-md">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      {selectedColumns.map((col, idx) => (
                        <th key={idx} className="border px-3 py-1 bg-gray-100 text-left">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        {selectedColumns.map((_, idx) => (
                          <td key={idx} className="border px-3 py-1 text-center text-gray-500">
                            Loading...
                          </td>
                        ))}
                      </tr>
                    ) : previewData.length > 0 ? (
                      previewData.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {selectedColumns.map((col, colIdx) => (
                            <td key={colIdx} className="border px-3 py-1 text-sm text-gray-700">
                              {row[col] !== undefined ? String(row[col]).replace(/^"|"$/g, "") : "N/A"}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={selectedColumns.length}
                          className="border px-3 py-1 text-center text-gray-500"
                        >
                          No Data Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColumnSelector;