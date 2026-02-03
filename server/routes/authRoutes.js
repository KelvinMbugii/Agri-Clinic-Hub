const express = require('express');
const router = express.Router();
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController');

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route PUT/ api/auth/reset-password
router.put('/reset-password/:token', resetPassword)

module.exports = router;
