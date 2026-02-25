const fs = require("fs");
const AiLog = require("../models/AiLog");
const { detectDisease, getModelStatus, chatWithKnowledge } = require("../services/aiService");
const { detectIntent } = require("../services/intentService");

// IMAGE DISEASE DETECTION
const detectDiseaseFromImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Please upload an image" });

    const imageBuffer = fs.readFileSync(req.file.path);
    const aiResult = await detectDisease(imageBuffer);

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

    res.json({
      success: true,
      detection: { ...aiResult, imageUrl: aiLog.imageUrl },
      logId: aiLog._id,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("AI Detection Error:", error);
    res.status(500).json({ message: "Failed to process image", error: error.message });
  }
};

// CHAT (text)
const chatAi = async (req, res) => {
  try {
    const { message, lastDetection } = req.body || {};
    if (!message || typeof message !== "string") return res.status(400).json({ message: "Please provide a message" });

    //const intent = detectIntent(message);
    console.log("Incoming message:", message);
    const intent = detectIntent(message);
    console.log("Detected intent:", intent);

   let reply;

   switch (intent){
    case "disease":
      reply = await chatWithKnowledge(message, lastDetection);
      break;

    case "weather":
      reply = "Weather advisory feature coming next phase";
      break;
    case "booking":
      reply = "To book an agricultural officer, go to the bookings section.";
      break;

    default:
      reply = await chatWithKnowledge(message, lastDetection);
   }

   res.json({ success:true, intent, reply});
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ message: "Failed to process chat message", error: error.message });
  }
};

// ADMIN LOGS & STATUS
const getAiLogs = async (req, res) => {
  try {
    const logs = await AiLog.find().populate("user", "name email role").sort({ createdAt: -1 });
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    console.error("Get AI Logs Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAiStatus = async (req, res) => {
  try {
    res.json({ success: true, model: getModelStatus() });
  } catch (error) {
    console.error("Get AI Status Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  detectDiseaseFromImage,
  chatAi,
  getAiLogs,
  getAiStatus,
};