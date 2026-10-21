// ============================================
// Project Routes
// ============================================
const express = require('express');
const router = express.Router();
const { getAllProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projects.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { createProjectRules, updateProjectRules, validate } = require('../utils/validators');

// All project routes are protected
router.use(authenticate);

router.get('/', getAllProjects);
router.get('/:id', getProject);
router.post('/', createProjectRules, validate, createProject);
router.put('/:id', updateProjectRules, validate, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
