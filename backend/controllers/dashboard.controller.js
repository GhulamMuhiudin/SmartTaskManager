// ============================================
// Dashboard Controller
// ============================================
const pool = require('../config/db');

/**
 * GET /api/dashboard/stats
 * Get overall task statistics
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // All counts in a single query
    const statsResult = await pool.query(
      `SELECT
        COUNT(*)::int AS total_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END)::int AS todo_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END)::int AS in_progress_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_tasks,
        COUNT(CASE WHEN priority = 'high' AND status != 'completed' THEN 1 END)::int AS high_priority_pending,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END)::int AS overdue_tasks
       FROM tasks
       WHERE user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];
    const completionRate = stats.total_tasks > 0
      ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
      : 0;

    // Project count
    const projectResult = await pool.query(
      'SELECT COUNT(*)::int AS total_projects FROM projects WHERE user_id = $1',
      [userId]
    );

    res.json({
      success: true,
      data: {
        ...stats,
        total_projects: projectResult.rows[0].total_projects,
        completion_rate: completionRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/upcoming
 * Get tasks due in the next 7 days
 */
const getUpcomingDeadlines = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, p.name AS project_name, p.color AS project_color
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.user_id = $1
         AND t.status != 'completed'
         AND t.due_date IS NOT NULL
         AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
       ORDER BY t.due_date ASC
       LIMIT 10`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/weekly
 * Get task completion data for last 7 days (for chart)
 */
const getWeeklyProductivity = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
        d.date::date AS date,
        COUNT(t.id)::int AS completed_count,
        COUNT(DISTINCT tc.id)::int AS created_count
       FROM generate_series(
         CURRENT_DATE - INTERVAL '6 days',
         CURRENT_DATE,
         '1 day'::interval
       ) AS d(date)
       LEFT JOIN tasks t ON t.user_id = $1
         AND t.status = 'completed'
         AND t.updated_at::date = d.date::date
       LEFT JOIN tasks tc ON tc.user_id = $1
         AND tc.created_at::date = d.date::date
       GROUP BY d.date
       ORDER BY d.date ASC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/activity
 * Get recent activity log
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM activity_log
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 15`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/overdue
 * Get overdue tasks
 */
const getOverdueTasks = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, p.name AS project_name, p.color AS project_color
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.user_id = $1
         AND t.status != 'completed'
         AND t.due_date < CURRENT_DATE
       ORDER BY t.due_date ASC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUpcomingDeadlines,
  getWeeklyProductivity,
  getRecentActivity,
  getOverdueTasks,
};
