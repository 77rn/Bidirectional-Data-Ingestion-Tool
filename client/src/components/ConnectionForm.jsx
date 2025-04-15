import React from "react";

const InputField = ({ label, name, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const ConnectionForm = ({ source, config, setConfig, setFlatFile }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig({ ...config, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFlatFile(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 mt-6 border border-gray-300 rounded-xl shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {source === "clickhouse" ? "ClickHouse Configuration" : "Flat File Configuration"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {source === "clickhouse" ? (
          <>
            <InputField label="Host" name="host" value={config.host} onChange={handleChange} placeholder="e.g., localhost" />
            <InputField label="Port" name="port" value={config.port} onChange={handleChange} placeholder="e.g., 8443" />
            <InputField label="Database" name="database" value={config.database} onChange={handleChange} placeholder="e.g., default" />
            <InputField label="User" name="user" value={config.user} onChange={handleChange} placeholder="e.g., default" />
            <InputField label="JWT Token" name="token" value={config.token} onChange={handleChange} placeholder="Paste JWT token here" />
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
    </div>
  );
};

export default ConnectionForm;