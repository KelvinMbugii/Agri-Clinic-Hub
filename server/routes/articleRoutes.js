const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');

// @route   GET /api/articles
// @desc    Get all articles
// @access  Public
router.get('/', getArticles);

// @route   POST /api/articles
// @desc    Create new article
// @access  Private (Officer)
router.post('/', authMiddleware, roleMiddleware('officer'), createArticle);

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Private (Officer)
router.put('/:id', authMiddleware, roleMiddleware('officer'), updateArticle);

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Private (Officer)
router.delete('/:id', authMiddleware, roleMiddleware('officer'), deleteArticle);

module.exports = router;
