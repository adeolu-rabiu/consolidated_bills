const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.status(200).json({ message: 'Login endpoint (stub)' });
});

router.post('/register', (req, res) => {
  res.status(201).json({ message: 'Register endpoint (stub)' });
});

module.exports = router;
