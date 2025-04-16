const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getClickHouseClient } = require('../utils/clickhouseclient');

const JWT_SECRET = process.env.JWT_SECRET;


const generateToken = (username, password) => {
  return jwt.sign({ username, password }, JWT_SECRET, { expiresIn: '1h' });
};

router.post('/', async (req, res) => {
  const { host, port, username, password } = req.body;
  try {
    const client = getClickHouseClient(host, port, username, password);

    const response = await client.query({
      query: 'SELECT 1',
      format: 'JSONEachRow',
    });

    const result = await response.json();

    if (Array.isArray(result) && result.length > 0) {
      const token = generateToken(username, password);
      return res.json({ token });
    } else {
      return res.status(401).json({ message: 'Invalid response from server' });
    }

  } catch (err) {
    console.error('Connection/auth error:', err);

    if (err.message?.includes('Code: 516') || err.message?.includes('authentication failed')) {
      return res.status(401).json({ message: 'Authentication failed. Please check your username/password.' });
    }

    return res.status(401).json({ message: 'Invalid credentials or connection issue' });
  }
});


module.exports = router;