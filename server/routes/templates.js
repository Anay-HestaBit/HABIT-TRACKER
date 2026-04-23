const express = require('express');
const { habitPacks } = require('../data/habitTemplates');

const router = express.Router();

// @route   GET /api/templates
// @desc    Get curated habit packs and templates
router.get('/', (req, res) => {
  res.json({ packs: habitPacks });
});

module.exports = router;
