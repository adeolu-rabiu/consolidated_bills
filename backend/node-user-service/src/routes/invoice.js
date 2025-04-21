const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all invoices endpoint (stub)' });
});

router.get('/:id', (req, res) => {
  res.status(200).json({ message: `Get invoice ${req.params.id} (stub)` });
});

module.exports = router;
