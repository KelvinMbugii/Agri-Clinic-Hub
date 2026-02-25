const axios = require("axios");
const FormData = require("form-data");
const Disease = require("../models/Diseases"); // MongoDB disease collection

const AI_SERVICE_URL = "http://localhost:8000/predict";


const normalizeDiseaseKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const findDiseaseRecord = async (diseaseName) => {
  if (!diseaseName) return null;

  const normalizedName = normalizeDiseaseKey(diseaseName);
  const compactModelName = normalizedName.replace(/\s+/g, "_"); 

  return Disease.findOne({
    $or: [
      { modelName: diseaseName },
      { displayName: diseaseName },
      { modelName: compactModelName },
      { displayName: { $regex: `^${normalizedName}$`, $options: "i" } },
      { modelName: { $regex: `^${compactModelName}$`, $options: "i" } },
      {
        displayName: {
          $regex: normalizedName
            .split(" ")
            .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
            .join("[_\\s-]*"),
          $options: "i",
        },
      },
    ],
  });
};


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
    const diseaseInfo = await findDiseaseRecord(aiDiseaseName);

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
const findDiseaseByTextSearch = async (message) => {
  const results = await Disease.find(
    { $text: { $search: message }},
    { score: { $meta: "textScore"}}
  )
    .sort({ score: { $meta: "textScore"}})
    .limit(1);


  return results [0] || null;

};

const chatWithKnowledge = async (message, lastDetection = {}) => {
  let diseaseInfo = await findDiseaseByTextSearch(message);

  if (!diseaseInfo && lastDetection?.detectedDisease) {
    diseaseInfo = await findDiseaseRecord(lastDetection.detectedDisease);
  }

  if (!diseaseInfo) {
    return [
      "I could not confidently match that to a known disease",
      "Please include crop name and key symptoms, or upload a new image.",
    ].join("\n");
  }

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

  return lines.join("\n");
};

module.exports = {
  detectDisease,
  getModelStatus,
  chatWithKnowledge,
};