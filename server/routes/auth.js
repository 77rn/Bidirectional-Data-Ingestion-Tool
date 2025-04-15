const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (username, password) => {
  return jwt.sign({ username, password }, JWT_SECRET, { expiresIn: '1h' });
};

router.post('/', (req, res) => {
    try{
      const token = generateToken(process.env.DB_NAME, process.env.PASSWORD);
      return res.json({ token });
    }catch(err){
      return res.status(401).json({ message: 'Invalid credentials' });
    }
});

module.exports = router;