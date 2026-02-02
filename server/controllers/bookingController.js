const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendBookingApproval, sendBookingConfirmation } = require('../services/smsService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Farmer)
const createBooking = async (req, res) => {
  try {
    const { officer, date, time, consultationType } = req.body;

    // Validation
    if (!officer || !date || !time || !consultationType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Verify officer exists and is verified
    const officerUser = await User.findById(officer);
    if (!officerUser || officerUser.role !== 'officer') {
      return res.status(400).json({ message: 'Invalid officer selected' });
    }

    if (!officerUser.isVerified) {
      return res.status(400).json({ message: 'Selected officer is not verified' });
    }

    // Create booking
    const booking = await Booking.create({
      farmer: req.user._id,
      officer,
      date,
      time,
      consultationType
    });

    // Populate references
    await booking.populate('farmer', 'name email phone');
    await booking.populate('officer', 'name email phone');

    res.status(201).json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get farmer's bookings
// @route   GET /api/bookings/my
// @access  Private (Farmer)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ farmer: req.user._id })
      .populate('farmer', 'name email phone')
      .populate('officer', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get assigned bookings for officer
// @route   GET /api/bookings/assigned
// @access  Private (Officer)
const getAssignedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ officer: req.user._id })
      .populate('farmer', 'name email phone')
      .populate('officer', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('Get Assigned Bookings Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private (Officer)
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify officer owns this booking
    if (booking.officer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Populate references
    await booking.populate('farmer', 'name email phone');
    await booking.populate('officer', 'name email phone');

    // Send SMS notification
    if (status === 'approved') {
      const farmer = await User.findById(booking.farmer);
      if (farmer) {
        await sendBookingApproval(farmer.phone, {
          date: booking.date,
          time: booking.time,
          consultationType: booking.consultationType
        });
      }
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAssignedBookings,
  updateBookingStatus
};
