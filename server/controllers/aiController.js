const AiLog = require('../models/AiLog');
const { detectDisease } = require('../services/aiService');
const path = require('path');
const fs = require('fs');

// @desc    Detect disease from image
// @route   POST /api/ai/detect-disease
// @access  Private (Farmer)
const detectDiseaseFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    const imagePath = req.file.path;

    // Call AI service to detect disease
    const aiResult = await detectDisease(imagePath);

    // Create AI log entry
    const aiLog = await AiLog.create({
      user: req.user._id,
      imageUrl: `/uploads/${req.file.filename}`,
      detectedDisease: aiResult.detectedDisease,
      confidenceScore: aiResult.confidenceScore,
      recommendations: aiResult.recommendations
    });

    res.json({
      success: true,
      detection: {
        detectedDisease: aiResult.detectedDisease,
        confidenceScore: aiResult.confidenceScore,
        recommendations: aiResult.recommendations,
        imageUrl: aiLog.imageUrl
      },
      logId: aiLog._id
    });
  } catch (error) {
    console.error('AI Detection Error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ message: 'Failed to process image', error: error.message });
  }
};

// @desc    Get AI logs (for admin)
// @route   GET /api/ai/logs
// @access  Private (Admin)
const getAiLogs = async (req, res) => {
  try {
    const logs = await AiLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    console.error('Get AI Logs Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  detectDiseaseFromImage,
  getAiLogs
};
