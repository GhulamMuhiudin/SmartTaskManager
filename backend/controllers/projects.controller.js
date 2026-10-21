// ============================================
// Projects Controller
// ============================================
const pool = require('../config/db');

/**
 * GET /api/projects
 * Get all projects for authenticated user
 */
const getAllProjects = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
        COUNT(t.id)::int AS task_count,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::int AS completed_count,
        COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END)::int AS in_progress_count
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 * Get single project with tasks
 */
const getProject = async (req, res, next) => {
  try {
    const projectResult = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const tasksResult = await pool.query(
      `SELECT * FROM tasks
       WHERE project_id = $1 AND user_id = $2
       ORDER BY CASE priority
         WHEN 'high' THEN 1
         WHEN 'medium' THEN 2
         WHEN 'low' THEN 3
       END, created_at DESC`,
      [req.params.id, req.user.id]
    );

    res.json({
      success: true,
      data: {
        ...projectResult.rows[0],
        tasks: tasksResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/projects
 * Create a new project
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const result = await pool.query(
      `INSERT INTO projects (user_id, name, description, color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, name, description || null, color || '#6366f1']
    );

    const project = result.rows[0];

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_title)
       VALUES ($1, 'created', 'project', $2, $3)`,
      [req.user.id, project.id, project.name]
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: { ...project, task_count: 0, completed_count: 0, in_progress_count: 0 },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id
 * Update a project
 */
const updateProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    // Check ownership
    const existing = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    const current = existing.rows[0];

    const result = await pool.query(
      `UPDATE projects
       SET name = $1, description = $2, color = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [
        name || current.name,
        description !== undefined ? description : current.description,
        color || current.color,
        req.params.id,
        req.user.id,
      ]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_title)
       VALUES ($1, 'updated', 'project', $2, $3)`,
      [req.user.id, req.params.id, result.rows[0].name]
    );

    res.json({
      success: true,
      message: 'Project updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 * Delete a project (tasks become unassigned)
 */
const deleteProject = async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING name',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.',
      });
    }

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_title)
       VALUES ($1, 'deleted', 'project', $2, $3)`,
      [req.user.id, req.params.id, result.rows[0].name]
    );

    res.json({
      success: true,
      message: 'Project deleted. Associated tasks are now unassigned.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllProjects, getProject, createProject, updateProject, deleteProject };
