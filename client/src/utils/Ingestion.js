import { startIngestion } from './api';

export const handleIngestion = async (source, config, flatFile, setStatus) => {
  setStatus("Ingestion in progress...");
  try {
    const result = await startIngestion(source, config, flatFile);

    const { status, message } = result.data;

    if (status === 'success') {
      setStatus(message);
    } else {
      setStatus("Ingestion failed. Please check your configuration.");
    }
  } catch (error) {
    setStatus("Ingestion failed. Please try again.");
    alert(error.message);
  }
};