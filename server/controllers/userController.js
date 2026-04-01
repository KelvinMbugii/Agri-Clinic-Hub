const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify officer
// @route   PATCH /api/users/:id/verify
// @access  Private (Admin)
const verifyOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'officer') {
      return res.status(400).json({ message: 'User is not an officer' });
    }

    user.isVerified = true;
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Verify Officer Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all officers
// @route   GET /api/users/officers
// @access  Private (Farmer/Admin)
const getOfficers = async (req, res) => {
  try {
    const officers = await User.find({ role: 'officer' }).select('-password').sort({ name: 1 });

    res.json({
      success: true,
      count: officers.length,
      officers
    });
  } catch (error) {
    console.error('Get Officers Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUsers,
  verifyOfficer,
  getOfficers,
  deleteUser
};
