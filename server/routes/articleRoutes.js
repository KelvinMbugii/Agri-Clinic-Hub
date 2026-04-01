const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(
      null,
      `article-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
    ),
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @route   GET /api/articles
// @desc    Get all articles
// @access  Public
router.get('/', getArticles);

// @route   POST /api/articles
// @desc    Create new article
// @access  Private (Officer)
router.post('/', authMiddleware, roleMiddleware('officer'), upload.single('image'), createArticle);

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Private (Officer)
router.put('/:id', authMiddleware, roleMiddleware('officer'), upload.single('image'), updateArticle);

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Private (Officer)
router.delete('/:id', authMiddleware, roleMiddleware('officer'), deleteArticle);

module.exports = router;
