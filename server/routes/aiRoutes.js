const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  detectDiseaseFromImage,
  chatAi,
  getAiLogs,
  getAiStatus,
} = require("../controllers/aiController");

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

// ROUTES
router.post(
  "/detect-disease",
  authMiddleware,
  roleMiddleware("farmer"),
  upload.single("image"),
  detectDiseaseFromImage,
);
router.post(
  "/chat",
  authMiddleware,
  roleMiddleware("farmer", "officer", "admin"),
  chatAi,
);
router.get("/logs", authMiddleware, roleMiddleware("admin"), getAiLogs);
router.get("/status", authMiddleware, roleMiddleware("admin"), getAiStatus);

module.exports = router;
