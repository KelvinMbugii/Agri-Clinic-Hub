const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['farmer', 'officer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user (trim password so stored hash is consistent with login)
    const user = await User.create({
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone?.trim(),
      password: String(password).trim(),
      role,
      isVerified: role === 'admin' ? true : false // Admin is auto-verified
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Normalize email to match DB (User schema stores email as lowercase)
    const emailNormalized = String(email).trim().toLowerCase();

    // Check if user exists
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare with trimmed password (must match how signup stores it)
    const passwordTrimmed = String(password).trim();
    const isMatch = await user.comparePassword(passwordTrimmed);
    if (!isMatch) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Auth] Login failed: user found but password mismatch for email:', emailNormalized);
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if officer is verified
    if (user.role === 'officer' && !user.isVerified) {
      return res.status(403).json({ 
        message: 'Your account is pending verification by an admin' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

//@route POST/api/auth/forgot-password
const forgotPassword = async (req, res) =>{
  try{
    const { email } = req.body;

    const user = await User.findOne({ email });
    if(!user){
      return res.status(404).json({message:'User not found'});
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your Agri-Clinic Hub account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `;
    await sendEmail({
      email: user.email,
      subject: 'Agri-Clinic Hub - Password Reset',
      html: message,
    });

    // SEND EMAIL HERE (Nodemailer / Email API)

    res.json({ success: true, message: 'Reset link sent to email'});

} catch (error){
  console.error(error);

  res.status(500).json({message: 'Email could not be sent',

    });
  }
};

// @route PUT/api/auth/reset-password/:token
const resetPassword = async(req, res) => {
  const resetTokenHashed = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  
  const user = await User.findOne({
    resetPasswordToken: resetTokenHashed,
    resetPasswordExpire: {$gt: Date.now()}
  });

  if (!user) {
    return res.status(400).json({message: 'Invalid or expired token'});
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ success: true, message: 'Password reset successful'});
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword
};
