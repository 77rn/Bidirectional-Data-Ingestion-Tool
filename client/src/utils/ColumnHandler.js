import { loadColumns, previewData } from './api';

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