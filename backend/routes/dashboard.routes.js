// ============================================
// Dashboard Routes
// ============================================
const express = require('express');
const router = express.Router();
const {
  getStats,
  getUpcomingDeadlines,
  getWeeklyProductivity,
  getRecentActivity,
  getOverdueTasks,
} = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All dashboard routes are protected
router.use(authenticate);

router.get('/stats', getStats);
router.get('/upcoming', getUpcomingDeadlines);
router.get('/weekly', getWeeklyProductivity);
router.get('/activity', getRecentActivity);
router.get('/overdue', getOverdueTasks);

module.exports = router;
