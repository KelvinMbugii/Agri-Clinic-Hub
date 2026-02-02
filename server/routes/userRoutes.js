const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getUsers,
  verifyOfficer
} = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/', authMiddleware, roleMiddleware('admin'), getUsers);

// @route   PATCH /api/users/:id/verify
// @desc    Verify officer
// @access  Private (Admin)
router.patch('/:id/verify', authMiddleware, roleMiddleware('admin'), verifyOfficer);

module.exports = router;
