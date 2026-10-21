// ============================================
// Auth Routes
// ============================================
const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { registerRules, loginRules, updateProfileRules, validate } = require('../utils/validators');

// Public routes
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileRules, validate, updateProfile);

module.exports = router;
