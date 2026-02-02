const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createBooking,
  getMyBookings,
  getAssignedBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private (Farmer)
router.post('/', authMiddleware, roleMiddleware('farmer'), createBooking);

// @route   GET /api/bookings/my
// @desc    Get farmer's bookings
// @access  Private (Farmer)
router.get('/my', authMiddleware, roleMiddleware('farmer'), getMyBookings);

// @route   GET /api/bookings/assigned
// @desc    Get assigned bookings for officer
// @access  Private (Officer)
router.get('/assigned', authMiddleware, roleMiddleware('officer'), getAssignedBookings);

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status
// @access  Private (Officer)
router.patch('/:id/status', authMiddleware, roleMiddleware('officer'), updateBookingStatus);

module.exports = router;
