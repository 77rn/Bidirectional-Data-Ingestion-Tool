import React from "react";

const SourceSelector = ({ source, setSource }) => {
  return (
    <div className="p-6 border border-gray-300 rounded-xl shadow-md bg-white flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Select Data Source</h2>
      <div className="flex gap-6">
        <button
          onClick={() => setSource("clickhouse")}
          className={`px-6 py-2 rounded-md font-medium border transition duration-200 ${
            source === "clickhouse"
              ? "bg-black text-white border-black shadow-md"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          ClickHouse
        </button>
        <button
          onClick={() => setSource("flatfile")}
          className={`px-6 py-2 rounded-md font-medium border transition duration-200 ${
            source === "flatfile"
              ? "bg-black text-white border-black shadow-md"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
          }`}
        >
          Flat File
        </button>
      </div>
    </div>
  );
};

export default SourceSelector;
