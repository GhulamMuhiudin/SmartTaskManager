// ============================================
// Input Validation Rules (express-validator)
// ============================================
const { body, query, param } = require('express-validator');
const { validationResult } = require('express-validator');

// ============================================
// Validation middleware — checks for errors
// ============================================
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// ============================================
// Auth Validators
// ============================================
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
    .matches(/\d/).withMessage('Password must contain a number.'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail(),
  body('currentPassword')
    .optional()
    .notEmpty().withMessage('Current password is required to change password.'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
    .matches(/\d/).withMessage('New password must contain a number.'),
];

// ============================================
// Task Validators
// ============================================
const VALID_STATUSES = ['todo', 'in_progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const createTaskRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters.'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  body('due_date')
    .optional({ values: 'null' })
    .isISO8601().withMessage('Invalid date format.'),
  body('project_id')
    .optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('Invalid project ID.'),
];

const updateTaskRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid task ID.'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty.')
    .isLength({ max: 200 }).withMessage('Title must be under 200 characters.'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  body('due_date')
    .optional({ values: 'null' })
    .isISO8601().withMessage('Invalid date format.'),
  body('project_id')
    .optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('Invalid project ID.'),
];

// ============================================
// Project Validators
// ============================================
const createProjectRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required.')
    .isLength({ max: 150 }).withMessage('Name must be under 150 characters.'),
  body('description')
    .optional()
    .trim(),
  body('color')
    .optional()
    .matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a valid hex code (e.g. #6366f1).'),
];

const updateProjectRules = [
  param('id').isInt({ min: 1 }).withMessage('Invalid project ID.'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Project name cannot be empty.')
    .isLength({ max: 150 }).withMessage('Name must be under 150 characters.'),
  body('description')
    .optional()
    .trim(),
  body('color')
    .optional()
    .matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a valid hex code.'),
];

// ============================================
// Query Validators (for filters)
// ============================================
const taskQueryRules = [
  query('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage('Invalid status filter.'),
  query('priority')
    .optional()
    .isIn(VALID_PRIORITIES).withMessage('Invalid priority filter.'),
  query('project_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid project filter.'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Search query too long.'),
  query('sort')
    .optional()
    .isIn(['created_at', 'due_date', 'priority', 'title', 'status'])
    .withMessage('Invalid sort field.'),
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Order must be asc or desc.'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  updateProfileRules,
  createTaskRules,
  updateTaskRules,
  createProjectRules,
  updateProjectRules,
  taskQueryRules,
  VALID_STATUSES,
  VALID_PRIORITIES,
};
