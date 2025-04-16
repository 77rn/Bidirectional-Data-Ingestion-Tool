import { loadColumns, previewData, fetchClickHouseColumns, fetchClickHouseTables,  fetchColumnDataFromApi} from './api';

export const handleLoadColumns = async (source, config, selectedTable, flatFile, delimiter, setColumns) => {
  try {
    const columns = await loadColumns(source, config, selectedTable, flatFile, delimiter);
    setColumns(columns);
  } catch (error) {
    alert(error.message);
  }
};

export const handlePreview = async (source, flatFile, selectedColumns, delimiter) => {
  try {
    const preview = await previewData(source, flatFile, selectedColumns, delimiter);
    console.table(preview);
    alert("Preview loaded — check console!");
  } catch (error) {
    alert(error.message);
  }
};

export const fetchColumnsFromBackend = async (config, selectedTable) => {
  console.log(config, selectedTable);
  const response = await fetchClickHouseColumns(config, selectedTable);
  return response.columns || [];
};

export const fetchTablesFromBackend = async (config) => {
  const response = await fetchClickHouseTables(config);
  return response.tables || [];
};

let columnDataTimer;

export const debouncedFetchColumnData = (config, tableName, columnNames, callback, limit, delay = 1000) => {
  clearTimeout(columnDataTimer);

  columnDataTimer = setTimeout(async () => {
    if (!tableName || !columnNames || columnNames.length === 0) {
      callback([]);
      return;
    }

    try {
      const data = await fetchColumnDataFromApi(config, tableName, columnNames, limit);
      callback(data);
    } catch (error) {
      console.error("Error fetching column data:", error.message);
      callback([]);
    }
  }, delay);
};
