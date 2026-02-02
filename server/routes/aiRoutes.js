const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  detectDiseaseFromImage,
  getAiLogs
} = require('../controllers/aiController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   POST /api/ai/detect-disease
// @desc    Detect disease from image
// @access  Private (Farmer)
router.post('/detect-disease', authMiddleware, roleMiddleware('farmer'), upload.single('image'), detectDiseaseFromImage);

// @route   GET /api/ai/logs
// @desc    Get AI logs
// @access  Private (Admin)
router.get('/logs', authMiddleware, roleMiddleware('admin'), getAiLogs);

module.exports = router;
