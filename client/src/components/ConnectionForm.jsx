import React, { useState, useEffect } from "react";

const InputField = ({ label, name, type, value, onChange, placeholder, readOnly = false }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

const ConnectionForm = ({ source, config, setConfig, setFlatFile, isAuthenticated = false, clearPreviewSignal = false }) => {
  const [headers, setHeaders] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState([]);
  const [fileContent, setFileContent] = useState([]);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    if (clearPreviewSignal) {
      setHeaders([]);
      setSelectedHeaders([]);
      setFileContent([]);
      setSelectAll(true);
    }
  }, [clearPreviewSignal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setConfig((prev) => ({ ...prev, filename: nameWithoutExt }));

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split("\n").map((line) => line.trim().split(config.delimiter || ","));
        const [headerRow, ...dataRows] = rows;

        setHeaders(headerRow);
        setSelectedHeaders(headerRow);
        setSelectAll(true);
        setFileContent(dataRows);

        setFlatFile(file);
      };

      reader.readAsText(file);
    }
  };

  const updateFlatFileWithSelectedColumns = (selected = selectedHeaders) => {
    if (!selected.length || !fileContent.length) return;

    const newCsv = [selected.join(",")];
    fileContent.forEach((row) => {
      const rowObj = headers.reduce((acc, col, idx) => {
        acc[col] = row[idx];
        return acc;
      }, {});
      const newRow = selected.map((col) => rowObj[col] || "").join(",");
      newCsv.push(newRow);
    });

    const blob = new Blob([newCsv.join("\n")], { type: "text/csv" });
    const newFile = new File([blob], `${config.filename}_selected.csv`, { type: "text/csv" });
    setFlatFile(newFile);
  };

  const toggleHeader = (header) => {
    const updated = selectedHeaders.includes(header)
      ? selectedHeaders.filter((h) => h !== header)
      : [...selectedHeaders, header];

    setSelectedHeaders(updated);
    setSelectAll(updated.length === headers.length);
    updateFlatFileWithSelectedColumns(updated);
  };

  const toggleSelectAll = () => {
    const updated = selectAll ? [] : [...headers];
    setSelectedHeaders(updated);
    setSelectAll(!selectAll);
    updateFlatFileWithSelectedColumns(updated);
  };

  return (
    <div className="p-6 mt-6 border border-gray-300 rounded-xl shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {source === "clickhouse" ? "ClickHouse Configuration" : "Flat File Configuration"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {source === "clickhouse" ? (
          <>
            <InputField label="Host" type="text" name="host" value={config.host} onChange={handleChange} placeholder="e.g., localhost" readOnly={isAuthenticated} />
            <InputField label="Port" type="text" name="port" value={config.port} onChange={handleChange} placeholder="e.g., 8443" readOnly={isAuthenticated} />
            <InputField label="Database" type="text" name="database" value={config.database} onChange={handleChange} placeholder="e.g., default" readOnly={isAuthenticated} />
            <InputField label="User" type="text" name="user" value={config.user} onChange={handleChange} placeholder="e.g., default" readOnly={isAuthenticated} />
            {!isAuthenticated && <InputField label="Password" name="password" type="password" value={config.password} onChange={handleChange} placeholder="Your password" />}
          </>
        ) : (
          <>
            <InputField label="Flat File Name" name="filename" value={config.filename} onChange={handleChange} placeholder="e.g., data.csv" />
            <InputField label="Delimiter" name="delimiter" value={config.delimiter} onChange={handleChange} placeholder="e.g., ," />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Upload Flat File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
      </div>

      {source === "flatfile" && headers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2 text-gray-800">Preview Columns</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              <span>Select All</span>
            </label>
            {headers.map((header) => (
              <label key={header} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedHeaders.includes(header)} onChange={() => toggleHeader(header)} />
                <span>{header}</span>
              </label>
            ))}
          </div>

          <div className="overflow-x-auto max-h-[320px] overflow-y-auto border rounded-lg shadow-sm">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {selectedHeaders.map((header, idx) => (
                    <th key={idx} className="px-3 py-2 border-b font-medium text-gray-700">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fileContent.map((row, rowIndex) => {
                  const rowObj = headers.reduce((acc, col, idx) => {
                    acc[col] = row[idx];
                    return acc;
                  }, {});
                  return (
                    <tr key={rowIndex}>
                      {selectedHeaders.map((col, colIdx) => (
                        <td key={colIdx} className="px-3 py-1 border-b text-gray-800">
                          {rowObj[col] || ""}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionForm;