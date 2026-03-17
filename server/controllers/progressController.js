const ProgressService = require('../services/ProgressService');
const logger = require('../utils/logger');

class ProgressController {
  async getDashboardData(req, res, next) {
    try {
      const data = await ProgressService.getDashboardData(req.user._id);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      next(error);
    }
  }

  async getChartData(req, res, next) {
    try {
      const data = await ProgressService.getChartData(req.user._id);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching chart data:', error);
      next(error);
    }
  }

  async getHeatmapData(req, res, next) {
    try {
      const data = await ProgressService.getHeatmapData(req.user._id);
      res.json(data);
    } catch (error) {
      logger.error('Error fetching heatmap data:', error);
      next(error);
    }
  }
}

module.exports = new ProgressController();
