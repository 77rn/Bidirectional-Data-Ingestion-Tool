import React from "react";

const SourceSelector = ({ source, setSource }) => {
  return (
    <div className="p-6 border border-gray-300 rounded-xl shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Data Source</h2>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="clickhouse"
            checked={source === "clickhouse"}
            onChange={() => setSource("clickhouse")}
            className="accent-blue-600"
          />
          <span className="text-gray-700 font-medium">ClickHouse</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="flatfile"
            checked={source === "flatfile"}
            onChange={() => setSource("flatfile")}
            className="accent-blue-600"
          />
          <span className="text-gray-700 font-medium">Flat File</span>
        </label>
      </div>
    </div>
  );
};

export default SourceSelector;