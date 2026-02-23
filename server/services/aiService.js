const axios = require("axios");
const FormData = require("form-data");
const Disease = require("../models/Diseases"); // MongoDB disease collection

const AI_SERVICE_URL = "http://localhost:8000/predict";

/**
 * Detect disease from image and fetch full info from MongoDB.
 * Returns a structured object for controller logging/response.
 */
const detectDisease = async (imageBuffer) => {
  try {
    const formData = new FormData();
    formData.append("file", imageBuffer, { filename: "image.jpg" });

    const response = await axios.post(AI_SERVICE_URL, formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
    });

    const { disease: aiDiseaseName, confidence } = response.data || {};

    if (!aiDiseaseName) {
      return { detectedDisease: null, confidenceScore: 0, source: "fallback" };
    }

    // Query MongoDB for full disease info
    const diseaseInfo = await Disease.findOne({ displayName: aiDiseaseName });

    if (!diseaseInfo) {
      return {
        detectedDisease: aiDiseaseName,
        confidenceScore: Math.round(confidence || 0),
        source: "python-fastapi",
      };
    }

    return {
      detectedDisease: diseaseInfo.displayName,
      confidenceScore: Math.round(confidence || 0),
      description: diseaseInfo.description,
      organicTreatment: diseaseInfo.treatment?.organic || [],
      chemicalTreatment: diseaseInfo.treatment?.chemical || [],
      prevention: diseaseInfo.prevention || [],
      severity: diseaseInfo.severity,
      source: "python-fastapi",
    };
  } catch (err) {
    console.error("AI Detection Error:", err.response?.data || err.message);
    return { detectedDisease: null, confidenceScore: 0, source: "fallback" };
  }
};

/**
 * Simple AI model status for /ai/status endpoint
 */
const getModelStatus = () => ({
  loaded: true,
  source: "Python FastAPI AI Service",
});

/**
 * Chat fallback helper using disease database.
 */
const chatWithKnowledge = async (message, lastDetection = {}) => {
  const text = String(message || "").toLowerCase();
  let diseaseKey = lastDetection?.detectedDisease || null;

  if (!diseaseKey) {
    const keywords = text.split(" ").filter((w) => w.length > 2);
    for (const k of keywords) {
      const disease = await Disease.findOne({
        $or: [
          { displayName: { $regex: k, $options: "i" } },
          { description: { $regex: k, $options: "i" } },
          { crop: { $regex: k, $options: "i" } },
          { symptoms: { $regex: k, $options: "i" } },
        ],
      });
      if (disease) {
        diseaseKey = disease.displayName;
        break;
      }
    }
  }

  if (!diseaseKey) {
    return [
      "I can help interpret disease scans and provide crop guidance.",
      "You can upload a photo or ask about symptoms, pests, or crop care.",
    ].join("\n");
  }

  const diseaseInfo = await Disease.findOne({ displayName: diseaseKey });
  if (!diseaseInfo) return "I have limited information about this disease.";

  const lines = [];
  lines.push(`🌿 **${diseaseInfo.displayName}**`);
  lines.push(`🟢 Crop: ${diseaseInfo.crop}`);
  lines.push(`🧬 Type: ${diseaseInfo.type}`);
  lines.push(`⚠ Severity: ${diseaseInfo.severity}`);

  if (diseaseInfo.symptoms?.length) {
    lines.push("🔍 Symptoms:");
    lines.push(...diseaseInfo.symptoms.map((s) => `- ${s}`));
  }
  if (diseaseInfo.treatment?.cultural?.length) {
    lines.push("💊 Cultural Treatments:");
    lines.push(...diseaseInfo.treatment.cultural.map((t) => `- ${t}`));
  }
  if (diseaseInfo.treatment?.chemical?.length) {
    lines.push("💊 Chemical Treatments:");
    lines.push(...diseaseInfo.treatment.chemical.map((t) => `- ${t}`));
  }
  if (diseaseInfo.treatment?.organic?.length) {
    lines.push("💊 Organic Treatments:");
    lines.push(...diseaseInfo.treatment.organic.map((t) => `- ${t}`));
  }
  if (diseaseInfo.prevention?.length) {
    lines.push("🛡 Prevention:");
    lines.push(...diseaseInfo.prevention.map((p) => `- ${p}`));
  }
  if (diseaseInfo.source?.name) {
    lines.push(
      `🔗 Source: ${diseaseInfo.source.name} (${diseaseInfo.source.url || "link unavailable"})`
    );
  }

  return lines.join("\n");
};

module.exports = {
  detectDisease,
  getModelStatus,
  chatWithKnowledge,
};