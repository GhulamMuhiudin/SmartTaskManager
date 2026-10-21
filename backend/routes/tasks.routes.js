// ============================================
// Task Routes
// ============================================
const express = require('express');
const router = express.Router();
const { getAllTasks, getTask, createTask, updateTask, deleteTask } = require('../controllers/tasks.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { createTaskRules, updateTaskRules, taskQueryRules, validate } = require('../utils/validators');

// All task routes are protected
router.use(authenticate);

router.get('/', taskQueryRules, validate, getAllTasks);
router.get('/:id', getTask);
router.post('/', createTaskRules, validate, createTask);
router.put('/:id', updateTaskRules, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
