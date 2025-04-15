const { createClient } = require('@clickhouse/client');

const getClickHouseClient = (host, port, username, password) => {
  try {
    const client = createClient({
      url: `${host}:${port}`,
      username,
      password,
    });


    return client;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { getClickHouseClient };