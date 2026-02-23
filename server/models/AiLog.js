const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  detectedDisease: {
    type: String,
    required: [true, 'Detected disease is required']
  },
  confidenceScore: {
    type: Number,
    required: [true, 'Confidence score is required'],
    min: 0,
    max: 100
  },

  description: {
    type: String,
    default: ''
  },
  organicTreatment: {
    type: [String],
    default: []
  },
  chemicalTreatment: {
    type: [String],
    default: []
  },
  prevention: {
    type: [String],
    default: []
  },
  severity: {
    type: String,
    default: 'Unknown'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AiLog', aiLogSchema);
