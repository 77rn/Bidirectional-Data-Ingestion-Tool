
import React, { useState } from "react";

const ColumnSelector = ({
  source,
  tables,
  selectedTable,
  setSelectedTable,
  columns,
  selectedColumns,
  setSelectedColumns,
  onLoadColumns,
  onPreview,
}) => {
  const toggleColumn = (col) => {
    if (selectedColumns.includes(col)) {
      setSelectedColumns(selectedColumns.filter((c) => c !== col));
    } else {
      setSelectedColumns([...selectedColumns, col]);
    }
  };

  return (
    <div className="p-6 mt-6 border border-gray-300 rounded-xl shadow-md bg-white">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Column Selection</h2>

      {source === "clickhouse" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Table</label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select a Table --</option>
            {tables.map((table, idx) => (
              <option key={idx} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4">
        {columns.map((col, idx) => (
          <label key={idx} className="flex items-center gap-2">
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

      <div className="flex gap-4">
        <button
          onClick={onLoadColumns}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Load Columns
        </button>
        <button
          onClick={onPreview}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
        >
          Preview Data
        </button>
      </div>
    </div>
  );
};

export default ColumnSelector;