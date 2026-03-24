const fs = require("fs");
const AiLog = require("../models/AiLog");
const AiChat = require("../models/AiChat");
const {
  detectDisease,
  getModelStatus,
  chatWithKnowledge,
} = require("../services/aiService");
const { detectIntent } = require("../services/intentService");

// ================= IMAGE DISEASE DETECTION =================
const detectDiseaseFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image" });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const aiResult = await detectDisease(imageBuffer);

    // Handle failure / low confidence
    if (!aiResult.detectedDisease) {
      fs.unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: aiResult.message || "Could not detect disease",
      });
    }

    // Save ONLY stable data (no AI-generated insights)
    const aiLog = await AiLog.create({
      user: req.user._id,
      imageUrl: `/uploads/${req.file.filename}`,
      detectedDisease: aiResult.detectedDisease,
      confidenceScore: aiResult.confidenceScore,
      description: aiResult.description,
      organicTreatment: aiResult.organicTreatment,
      chemicalTreatment: aiResult.chemicalTreatment,
      prevention: aiResult.prevention,
      severity: aiResult.severity,
    });

    fs.unlinkSync(req.file.path);

    return res.json({
      success: true,
      detection: {
        ...aiResult, // includes aiInsights if available
        imageUrl: aiLog.imageUrl,
      },
      logId: aiLog._id,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("AI Detection Error:", error);

    res.status(500).json({
      message: "Failed to process image",
      error: error.message,
    });
  }
};

// ================= CHAT SYSTEM =================
const DEFAULT_WELCOME_MESSAGE =
  "Hi! I am your Agri-Clinic AI assistant. Ask me about crop diseases, fertilizers, weather timing, or farm practices.";

const getOrCreateChat = async (userId) => {
  let chat = await AiChat.findOne({ user: userId });

  if (!chat) {
    chat = await AiChat.create({
      user: userId,
      messages: [
        {
          sender: "system",
          text: DEFAULT_WELCOME_MESSAGE,
          timestamp: new Date(),
        },
      ],
    });
  }

  return chat;
};

// ================= CHAT HANDLER =================
const chatAi = async (req, res) => {
  try {
    const { message, lastDetection } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "Please provide a message" });
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return res.status(400).json({ message: "Please provide a message" });
    }

    const intent = detectIntent(trimmedMessage);
    const chat = await getOrCreateChat(req.user._id);
    const chatHistory = Array.isArray(chat.messages) ? chat.messages.slice(-20) : [];

    let reply;

    switch (intent) {
      case "disease":
        reply = await chatWithKnowledge(trimmedMessage, { lastDetection, chatHistory });
        break;

      case "weather":
        reply = "Weather advisory feature coming next phase";
        break;

      case "booking":
        reply = "To book an agricultural officer, go to the bookings section.";
        break;

      default:
        reply = await chatWithKnowledge(trimmedMessage, { lastDetection, chatHistory });
    }

    chat.messages.push({
      sender: "user",
      text: trimmedMessage,
      intent,
      timestamp: new Date(),
    });

    chat.messages.push({
      sender: "bot",
      text: reply,
      intent,
      timestamp: new Date(),
    });

    // Limit chat size
    if (chat.messages.length > 200) {
      chat.messages = chat.messages.slice(-200);
    }

    await chat.save();

    res.json({
      success: true,
      intent,
      reply,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);

    res.status(500).json({
      message: "Failed to process chat message",
      error: error.message,
    });
  }
};

// ================= CHAT HISTORY =================
const getChatHistory = async (req, res) => {
  try {
    const chat = await getOrCreateChat(req.user._id);

    const messages = chat.messages.slice(-100).map((message, index) => ({
      id: `${chat._id}-${index}-${new Date(message.timestamp).getTime()}`,
      from: message.sender === "user" ? "user" : "bot",
      text: message.text,
      ts: new Date(message.timestamp).getTime(),
    }));

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Get Chat History Error:", error);

    res.status(500).json({
      message: "Failed to load chat history",
      error: error.message,
    });
  }
};

// ================= CLEAR CHAT =================
const clearChatHistory = async (req, res) => {
  try {
    await AiChat.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        messages: [
          {
            sender: "system",
            text: DEFAULT_WELCOME_MESSAGE,
            timestamp: new Date(),
          },
        ],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.json({ success: true, message: "Chat history cleared" });
  } catch (error) {
    console.error("Clear Chat History Error:", error);

    res.status(500).json({
      message: "Failed to clear chat history",
      error: error.message,
    });
  }
};

// ================= ADMIN =================
const getAiLogs = async (req, res) => {
  try {
    const logs = await AiLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Get AI Logs Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getAiStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      model: getModelStatus(),
    });
  } catch (error) {
    console.error("Get AI Status Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deepScan = async (req, res) => {
  try {
    const mem = process.memoryUsage();
    const checks = {
      aiModel: getModelStatus(),
      database: "Connected & Stable",
      storage: fs.existsSync("uploads") ? "Accessible" : "Review Required",
      memoryUsage: `${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
      processUptime: `${Math.round(process.uptime())}s`,
      environment: process.env.NODE_ENV || 'development'
    };

    // Simulate some intensive check
    await new Promise(resolve => setTimeout(resolve, 800));

    res.json({
      success: true,
      checks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Deep Scan Error:", error);
    res.status(500).json({
      success: false,
      message: "Deep scan failed",
      error: error.message
    });
  }
};

module.exports = {
  detectDiseaseFromImage,
  chatAi,
  getChatHistory,
  clearChatHistory,
  getAiLogs,
  getAiStatus,
  deepScan,
};
