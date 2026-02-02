const Article = require('../models/Article');

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    const articles = await Article.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error('Get Articles Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private (Officer)
const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }

    const article = await Article.create({
      title,
      content,
      author: req.user._id
    });

    await article.populate('author', 'name email');

    res.status(201).json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Create Article Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (Officer)
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Verify author
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    // Update fields
    if (title) article.title = title;
    if (content) article.content = content;
    await article.save();

    await article.populate('author', 'name email');

    res.json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Update Article Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Officer)
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Verify author
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await article.deleteOne();

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete Article Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle
};
