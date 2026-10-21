// ============================================
// Tasks Controller
// ============================================
const pool = require('../config/db');

/**
 * GET /api/tasks
 * Get all tasks for authenticated user with filters
 */
const getAllTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, priority, project_id, search, sort, order } = req.query;

    let query = `
      SELECT t.*, p.name as project_name, p.color as project_color
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    // Apply filters
    if (status) {
      query += ` AND t.status = $${paramIndex++}`;
      params.push(status);
    }

    if (priority) {
      query += ` AND t.priority = $${paramIndex++}`;
      params.push(priority);
    }

    if (project_id) {
      query += ` AND t.project_id = $${paramIndex++}`;
      params.push(parseInt(project_id));
    }

    if (search) {
      query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Sorting
    const sortField = sort || 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    // Custom sort for priority
    if (sortField === 'priority') {
      query += ` ORDER BY CASE t.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
        END ${sortOrder}`;
    } else if (sortField === 'status') {
      query += ` ORDER BY CASE t.status
        WHEN 'todo' THEN 1
        WHEN 'in_progress' THEN 2
        WHEN 'completed' THEN 3
        END ${sortOrder}`;
    } else {
      query += ` ORDER BY t.${sortField} ${sortOrder}`;
    }

    const result = await pool.query(query, params);

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
 * GET /api/tasks/:id
 * Get single task by ID
 */
const getTask = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, p.name as project_name, p.color as project_color
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tasks
 * Create a new task
 */
const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, status, priority, due_date, project_id } = req.body;

    // If project_id provided, verify it belongs to user
    if (project_id) {
      const projectCheck = await pool.query(
        'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
        [project_id, userId]
      );
      if (projectCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Project not found or not owned by you.',
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks (user_id, project_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        project_id || null,
        title,
        description || null,
        status || 'todo',
        priority || 'medium',
        due_date || null,
      ]
    );

    const task = result.rows[0];

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_title)
       VALUES ($1, 'created', 'task', $2, $3)`,
      [userId, task.id, task.title]
    );

    // Fetch with project info
    const fullTask = await pool.query(
      `SELECT t.*, p.name as project_name, p.color as project_color
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [task.id]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: fullTask.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tasks/:id
 * Update an existing task
 */
const updateTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { title, description, status, priority, due_date, project_id } = req.body;

    // Check task exists and belongs to user
    const taskCheck = await pool.query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [taskId, userId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const currentTask = taskCheck.rows[0];

    // If project_id changed, verify new project belongs to user
    const newProjectId = project_id !== undefined ? project_id : currentTask.project_id;
    if (newProjectId && newProjectId !== currentTask.project_id) {
      const projectCheck = await pool.query(
        'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
        [newProjectId, userId]
      );
      if (projectCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Project not found or not owned by you.',
        });
      }
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3, priority = $4,
           due_date = $5, project_id = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        title !== undefined ? title : currentTask.title,
        description !== undefined ? description : currentTask.description,
        status || currentTask.status,
        priority || currentTask.priority,
        due_date !== undefined ? due_date : currentTask.due_date,
        newProjectId,
        taskId,
        userId,
      ]
    );

    // Determine action for activity log
    let action = 'updated';
    if (status === 'completed' && currentTask.status !== 'completed') {
      action = 'completed';
    }

    await pool.query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_title)
       VALUES ($1, $2, 'task', $3, $4)`,
      [userId, action, taskId, result.rows[0].title]
    );

    // Fetch with project info
    const fullTask = await pool.query(
      `SELECT t.*, p.name as project_name, p.color as project_color
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [taskId]
    );

    res.json({
      success: true,
      message: 'Task updated successfully.',
      data: fullTask.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
const deleteTask = async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING title',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (user_id, action, entity_type, entity_id, entity_title)
       VALUES ($1, 'deleted', 'task', $2, $3)`,
      [req.user.id, req.params.id, result.rows[0].title]
    );

    res.json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTasks, getTask, createTask, updateTask, deleteTask };
