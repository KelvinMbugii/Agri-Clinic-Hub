const mongoose = require('mongoose');

const aiChatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'bot', 'system'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    intent: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const aiChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true,
      index: true,
    },
    messages: {
      type: [aiChatMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AiChat', aiChatSchema);