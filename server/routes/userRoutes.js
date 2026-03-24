const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getUsers,
  verifyOfficer,
  getOfficers
} = require('../controllers/userController');

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/', authMiddleware, roleMiddleware('admin'), getUsers);

// @route   GET /api/users/officers
// @desc    Get all officers
// @access  Private (Farmer/Admin)
router.get('/officers', authMiddleware, roleMiddleware('farmer', 'admin'), getOfficers);

// @route   PATCH /api/users/:id/verify
// @desc    Verify officer
// @access  Private (Admin)
router.patch('/:id/verify', authMiddleware, roleMiddleware('admin'), verifyOfficer);

module.exports = router;
