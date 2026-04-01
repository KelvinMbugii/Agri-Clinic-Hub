const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  detectDiseaseFromImage,
  chatAi,
  getChatHistory,
  clearChatHistory,
  getAiLogs,
  getAiStatus,
  deepScan,
} = require("../controllers/aiController");

const {
  addDiseaseKnowledge,
  retrainModel,
  extractAndSeedKnowledge,
  uploadAndSeedKnowledge,
} = require("../controllers/aiKnowledgeController");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      `image-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`,
    ),
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Document Multer setup
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `doc-${Date.now()}-${file.originalname}`),
});
const docFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "text/plain" ||
    file.originalname.endsWith(".pdf") || 
    file.originalname.endsWith(".txt")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only .pdf and .txt files are allowed"), false);
  }
};
const uploadDoc = multer({
  storage: docStorage,
  fileFilter: docFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for docs
});

// ROUTES
router.post( "/detect-disease", authMiddleware, roleMiddleware("farmer"), upload.single("image"), detectDiseaseFromImage);
router.post( "/chat", authMiddleware, roleMiddleware("farmer", "officer", "admin"), chatAi);

router.get( "/chat/history", authMiddleware, roleMiddleware("farmer", "officer", "admin"), getChatHistory);
router.delete( "/chat/history", authMiddleware, roleMiddleware("farmer", "officer", "admin"), clearChatHistory);

router.get( "/logs", authMiddleware, roleMiddleware("admin"), getAiLogs);
router.get( "/status", authMiddleware, roleMiddleware("admin"), getAiStatus);
router.get( "/deep-scan", authMiddleware, roleMiddleware("admin"), deepScan);

// AI Data Management (Admin explicitly)
router.post("/knowledge", authMiddleware, roleMiddleware("admin"), addDiseaseKnowledge);
router.post("/extract-knowledge", authMiddleware, roleMiddleware("admin"), extractAndSeedKnowledge);
router.post("/upload-knowledge", authMiddleware, roleMiddleware("admin"), uploadDoc.single("document"), uploadAndSeedKnowledge);
router.post("/retrain", authMiddleware, roleMiddleware("admin"), retrainModel);

module.exports = router;
