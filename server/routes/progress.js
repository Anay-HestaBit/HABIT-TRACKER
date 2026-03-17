const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

// @route   GET /api/progress/dashboard
router.get('/dashboard', protect, progressController.getDashboardData.bind(progressController));

// @route   GET /api/progress/heatmap
router.get('/heatmap', protect, progressController.getHeatmapData.bind(progressController));

// @route   GET /api/progress/charts
router.get('/charts', protect, progressController.getChartData.bind(progressController));

module.exports = router;
