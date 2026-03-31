// const axios = require("axios");
// const FormData = require("form-data");
// const Disease = require("../models/Diseases");
// const { enhanceDiseaseData } = require("./aiEnhancer.service");

// const AI_SERVICE_URL = "http://localhost:8000/predict";

// /**
//  * Normalize disease names for flexible matching
//  */
// const normalizeDiseaseKey = (value = "") =>
//   String(value)
//     .trim()
//     .toLowerCase()
//     .replace(/[_-]+/g, " ")
//     .replace(/\s+/g, " ");

// /**
//  * Find disease record in MongoDB using multiple matching strategies
//  */
// const findDiseaseRecord = async (diseaseName) => {
//   if (!diseaseName) return null;

//   const normalizedName = normalizeDiseaseKey(diseaseName);
//   const compactModelName = normalizedName.replace(/\s+/g, "_");

//   return Disease.findOne({
//     $or: [
//       { modelName: diseaseName },
//       { displayName: diseaseName },
//       { modelName: compactModelName },
//       { displayName: { $regex: `^${normalizedName}$`, $options: "i" } },
//       { modelName: { $regex: `^${compactModelName}$`, $options: "i" } },
//       {
//         displayName: {
//           $regex: normalizedName
//             .split(" ")
//             .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
//             .join("[_\\s-]*"),
//           $options: "i",
//         },
//       },
//     ],
//   });
// };

// /**
//  * Detect disease from image and enrich with MongoDB + AI insights
//  */
// const detectDisease = async (imageBuffer) => {
//   try {
//     // Step 1: Send image to Python CV service
//     const formData = new FormData();
//     formData.append("file", imageBuffer, { filename: "image.jpg" });

//     const response = await axios.post(AI_SERVICE_URL, formData, {
//       headers: formData.getHeaders(),
//       timeout: 30000,
//     });

//     const { disease: aiDiseaseName, confidence } = response.data || {};

//     // Step 2: Handle missing detection
//     if (!aiDiseaseName) {
//       return {
//         detectedDisease: null,
//         confidenceScore: 0,
//         source: "fallback",
//       };
//     }

//     // Step 3: Confidence guard (important)
//     if ((confidence || 0) < 0.7) {
//       return {
//         detectedDisease: aiDiseaseName,
//         confidenceScore: Math.round(confidence || 0),
//         message: "Low confidence. Please upload a clearer image.",
//         source: "python-fastapi",
//       };
//     }

//     // Step 4: Fetch disease info from MongoDB
//     const diseaseInfo = await findDiseaseRecord(aiDiseaseName);

//     // Step 5: If no DB match, return basic response + AI enhancement
//     if (!diseaseInfo) {
//       const baseResponse = {
//         detectedDisease: aiDiseaseName,
//         confidenceScore: Math.round(confidence || 0),
//         severity: "unknown",
//         crop: "unknown",
//         source: "python-fastapi",
//       };

//       const aiEnhancement = await enhanceDiseaseData(baseResponse);

//       return {
//         ...baseResponse,
//         aiInsights: aiEnhancement || {},
//       };
//     }

//     // Step 6: Build base response from DB
//     const baseResponse = {
//       detectedDisease: diseaseInfo.displayName,
//       confidenceScore: Math.round(confidence || 0),
//       description: diseaseInfo.description,
//       organicTreatment: diseaseInfo.treatment?.organic || [],
//       chemicalTreatment: diseaseInfo.treatment?.chemical || [],
//       prevention: diseaseInfo.prevention || [],
//       severity: diseaseInfo.severity,
//       crop: diseaseInfo.crop,
//       source: "python-fastapi",
//     };

//     // Step 7: Skip AI if data already rich (cost optimization)
//     const hasEnoughData =
//       baseResponse.organicTreatment.length && baseResponse.prevention.length;

//     if (hasEnoughData) {
//       return baseResponse;
//     }

//     // Step 8: AI Enhancement Layer
//     const aiEnhancement = await enhanceDiseaseData(baseResponse);

//     // Step 9: Final merged response
//     return {
//       ...baseResponse,
//       aiInsights: aiEnhancement || {},
//     };
//   } catch (err) {
//     console.error("AI Detection Error:", err.response?.data || err.message);

//     return {
//       detectedDisease: null,
//       confidenceScore: 0,
//       source: "fallback",
//     };
//   }
// };

// /**
//  * Model status check
//  */
// const getModelStatus = () => ({
//   loaded: true,
//   source: "Python FastAPI AI Service",
// });

// /**
//  * Text-based disease search (chat fallback)
//  */
// const findDiseaseByTextSearch = async (message) => {
//   const results = await Disease.find(
//     { $text: { $search: message } },
//     { score: { $meta: "textScore" } },
//   )
//     .sort({ score: { $meta: "textScore" } })
//     .limit(1);

//   return results[0] || null;
// };

// /**
//  * Chat-based knowledge response
//  */
// const chatWithKnowledge = async (message, lastDetection = {}) => {
//   let diseaseInfo = await findDiseaseByTextSearch(message);

//   if (!diseaseInfo && lastDetection?.detectedDisease) {
//     diseaseInfo = await findDiseaseRecord(lastDetection.detectedDisease);
//   }

//   if (!diseaseInfo) {
//     return [
//       "I could not confidently match that to a known disease.",
//       "Please include crop name and key symptoms, or upload a new image.",
//     ].join("\n");
//   }

//   const lines = [];

//   lines.push(`🌿 **${diseaseInfo.displayName}**`);
//   lines.push(`🟢 Crop: ${diseaseInfo.crop}`);
//   lines.push(`🧬 Type: ${diseaseInfo.type}`);
//   lines.push(`⚠ Severity: ${diseaseInfo.severity}`);

//   if (diseaseInfo.symptoms?.length) {
//     lines.push("🔍 Symptoms:");
//     lines.push(...diseaseInfo.symptoms.map((s) => `- ${s}`));
//   }

//   if (diseaseInfo.treatment?.cultural?.length) {
//     lines.push("💊 Cultural Treatments:");
//     lines.push(...diseaseInfo.treatment.cultural.map((t) => `- ${t}`));
//   }

//   if (diseaseInfo.treatment?.chemical?.length) {
//     lines.push("💊 Chemical Treatments:");
//     lines.push(...diseaseInfo.treatment.chemical.map((t) => `- ${t}`));
//   }

//   if (diseaseInfo.treatment?.organic?.length) {
//     lines.push("💊 Organic Treatments:");
//     lines.push(...diseaseInfo.treatment.organic.map((t) => `- ${t}`));
//   }

//   if (diseaseInfo.prevention?.length) {
//     lines.push("🛡 Prevention:");
//     lines.push(...diseaseInfo.prevention.map((p) => `- ${p}`));
//   }

//   return lines.join("\n");
const axios = require("axios");
const FormData = require("form-data");
const Disease = require("../models/Diseases");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { enhanceWithRAG } = require("./aiEnhancerService");
const { querySimilarDiseases } = require("./embeddingService");
const { cleanTreatmentArray, summarizeTreatmentsForPrompt } = require("../utils/treatmentUtils");

const AI_SERVICE_URL = process.env.AI_CV_SERVICE_URL || "http://localhost:8000/predict";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Normalize disease names for flexible matching
 */
const normalizeDiseaseKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

/**
 * Find disease record in MongoDB using multiple matching strategies
 */
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
 * Detect disease from image and enrich with MongoDB + AI insights
 */
const detectDisease = async (imageBuffer) => {
  try {
    // 1️⃣ Send image to Python CV service
    const formData = new FormData();
    formData.append("file", imageBuffer, { filename: "image.jpg" });

    const response = await axios.post(AI_SERVICE_URL, formData, {
      headers: formData.getHeaders(),
      timeout: 30000,
    });

    const { disease: aiDiseaseName, confidence } = response.data || {};

    // 2️⃣ Handle missing detection
    if (!aiDiseaseName) {
      return { detectedDisease: null, confidenceScore: 0, source: "fallback" };
    }

    // 3️⃣ Confidence guard (Reverted Gemini Rescue)
    const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;
    if (normalizedConfidence < 0.70) {
      return {
        detectedDisease: aiDiseaseName,
        confidenceScore: Math.round(normalizedConfidence * 100),
        message: "Low confidence. Please upload a clearer image.",
        source: "python-fastapi",
      };
    }

    const finalResult = {
      detectedDisease: aiDiseaseName,
      confidenceScore: Math.round(normalizedConfidence * 100),
      source: "python-fastapi",
    };

    const { detectedDisease: finalDiseaseName } = finalResult;

    // 4️⃣ Fetch disease info from MongoDB
    const diseaseInfo = await findDiseaseRecord(finalDiseaseName);

    // 5️⃣ If no DB match, return basic response + RAG AI enhancement
    if (!diseaseInfo) {
      const baseResponse = {
        ...finalResult,
        severity: "unknown",
        crop: "unknown",
      };

      const aiEnhancement = await enhanceWithRAG(baseResponse);

      return { ...baseResponse, aiInsights: aiEnhancement || {} };
    }

    // 6️⃣ Build base response from DB
    const baseResponse = {
      ...finalResult,
      detectedDisease: diseaseInfo.displayName,
      description: diseaseInfo.description,
      organicTreatment: cleanTreatmentArray(diseaseInfo.treatment?.organic || []),
      chemicalTreatment: cleanTreatmentArray(diseaseInfo.treatment?.chemical || []),
      prevention: cleanTreatmentArray(diseaseInfo.prevention || []),
      severity: diseaseInfo.severity,
      crop: diseaseInfo.crop,
    };

    // 7️⃣ Prepare base response for enhancement
    // We used to skip AI if data was "enough", but "enough" might be technical junk.
    // Now we always proceed to AI enhancement for the best farmer-friendly tone.

    // 8️⃣ AI Enhancement Layer using RAG
    const aiEnhancement = await enhanceWithRAG(baseResponse);

    // 9️⃣ Return merged response
    return { ...baseResponse, aiInsights: aiEnhancement || {} };
  } catch (err) {
    console.error("AI Detection Error:", err.response?.data || err.message);
    return { detectedDisease: null, confidenceScore: 0, source: "fallback" };
  }
};

/**
 * Model status check
 */
const getModelStatus = () => ({
  loaded: true,
  source: "Python FastAPI AI Service",
});

/**
 * Text-based disease search (chat fallback)
 */
const findDiseaseByTextSearch = async (message) => {
  const results = await Disease.find({ $text: { $search: message } }, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(1);

  return results[0] || null;
};

/**
 * Chat-based knowledge response
 */
const chatWithKnowledge = async (message, { lastDetection = {}, chatHistory = [] } = {}) => {
  const recentTurns = Array.isArray(chatHistory) ? chatHistory.slice(-10) : [];
  const recentUserText = recentTurns
    .filter((m) => m?.sender === "user" && typeof m.text === "string")
    .map((m) => m.text)
    .slice(-6)
    .join("\n");

  const combinedQuery = [recentUserText, message, lastDetection?.detectedDisease].filter(Boolean).join("\n");

  let diseaseInfo = await findDiseaseByTextSearch(message);

  if (!diseaseInfo && lastDetection?.detectedDisease) {
    diseaseInfo = await findDiseaseRecord(lastDetection.detectedDisease);
  }

  // Unified RAG Vector Retrieval
  let pineconeMatches = [];
  try {
    pineconeMatches = await querySimilarDiseases(combinedQuery, 3);
  } catch (err) {
    console.warn("Unified RAG embedding lookup failed:", err.message);
  }

  // Helper to sanitize database strings
  const cleanStr = (val) => (val && val !== "undefined" && val !== "null" ? val : "Unknown");

  // Fallback: deterministic explanation if LLM fails.
  const formatDisease = () => {
    if (!diseaseInfo) {
      return "I found some general farming guidelines for your query. Please tell me more about the crop and symptoms you are seeing.";
    }

    const lines = [];
    const displayName = cleanStr(diseaseInfo.displayName);
    const crop = cleanStr(diseaseInfo.crop);
    const type = cleanStr(diseaseInfo.type);
    const severity = cleanStr(diseaseInfo.severity);

    lines.push(`Here is what I found regarding **${displayName}**.`);

    lines.push("");

    const details = [];
    if (crop !== "Unknown") details.push(`🌱 **Crop:** ${crop}`);
    if (type !== "Unknown") details.push(`🦠 **Type:** ${type}`);
    if (severity !== "Unknown") details.push(`⚠️ **Severity:** ${severity}`);

    if (details.length > 0) {
      lines.push(details.join("  |  "));
      lines.push("");
    }

    const symptoms = cleanTreatmentArray(diseaseInfo.symptoms);
    if (symptoms.length) {
      lines.push("**Key Symptoms:**");
      lines.push(...symptoms.slice(0, 6).map((s) => `- ${s}`));
      lines.push("");
    }

    const cultural = cleanTreatmentArray(diseaseInfo.treatment?.cultural);
    const chemical = cleanTreatmentArray(diseaseInfo.treatment?.chemical);
    const organic = cleanTreatmentArray(diseaseInfo.treatment?.organic);

    if (organic.length || chemical.length || cultural.length) {
      lines.push("**Recommended Treatments:**");
      if (organic.length) lines.push("- *Organic:* " + organic.slice(0, 3).join(", "));
      if (chemical.length) lines.push("- *Chemical:* " + chemical.slice(0, 2).join(", "));
      if (cultural.length) lines.push("- *Cultural:* " + cultural.slice(0, 3).join(", "));
      lines.push("");
    }

    const prevention = cleanTreatmentArray(diseaseInfo.prevention);
    if (prevention.length) {
      lines.push("**Prevention Tips:**");
      lines.push(...prevention.slice(0, 5).map((p) => `- ${p}`));
      lines.push("");
    }

    lines.push("*Note: This is an automated summary. For severe cases, please consult a local agricultural officer.*");
    return lines.join("\n").trim();
  };

  if (!diseaseInfo && (!pineconeMatches || pineconeMatches.length === 0)) {
    return [
      "I could not confidently match that to a known disease or guideline.",
      "Please tell me the crop name and the main symptoms you're seeing.",
      lastDetection?.detectedDisease ? `If you meant your last scan (${lastDetection.detectedDisease}), try asking: "How do I treat this?"` : "",
    ].join("\n");
  }

  try {
    const historyForPrompt = recentTurns.map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");

    let knowledgeForPrompt = "";

    if (diseaseInfo) {
      knowledgeForPrompt += `
[STRUCTURED DB MATCH]
Disease: ${cleanStr(diseaseInfo.displayName)}
Crop: ${cleanStr(diseaseInfo.crop)}
Symptoms: ${cleanTreatmentArray(diseaseInfo.symptoms).join("; ")}
Organic Treatments: ${summarizeTreatmentsForPrompt(diseaseInfo.treatment?.organic, 5)}
Chemical Treatments: ${summarizeTreatmentsForPrompt(diseaseInfo.treatment?.chemical, 5)}
Cultural Treatments: ${summarizeTreatmentsForPrompt(diseaseInfo.treatment?.cultural, 5)}
Prevention: ${summarizeTreatmentsForPrompt(diseaseInfo.prevention, 5)}
\n`.trim();
    }

    if (pineconeMatches && pineconeMatches.length > 0) {
      knowledgeForPrompt += "\n\n[RELEVANT SEMANTIC DOCUMENT CHUNKS]\n";
      pineconeMatches.forEach((match) => {
        if (match.metadata.type === "document") {
          knowledgeForPrompt += `--- SOURCE DOCUMENT: ${match.metadata.sourceDocument || "Unknown"} ---\n${match.metadata.snippet}\n\n`;
        } else if (match.metadata.type === "disease_schema" && !diseaseInfo) {
          knowledgeForPrompt += `--- ENCYCLOPEDIA RECORD: ${match.metadata.displayName || "Unknown"} ---\n${match.metadata.snippet}\n\n`;
        }
      });
    }

    const systemPrompt = `
You are a warm, professional Agricultural Extension Officer. 
Your goal is to provide practical, actionable, and safe advice to farmers.

### **Core Instructions:**
1. **Directness:** Get straight to the facts. No fluff.
2. **Knowledge Priority:** Use the provided DB matches and document chunks. If they contain long technical lists, **summarize them** into 2-3 practical steps.
3. **Format:** Use bold headers. Structure advice into:
   - **🔍 Analysis:** Simple explanation of the problem.
   - **✅ Action Plan:** Practical steps (prioritize organic/cultural if effective).
   - **🛡 Prevention:** How to stop it from coming back.
4. **Safety:** Mention protective gear for chemical use and following product labels.
5. **Tone:** Supporting and expert. Avoid overwhelming the farmer with jargon.

**CRITICAL:** Provide a substantive, helpful answer based on the knowledge provided.
`.trim();

    const userPrompt = `
Conversation history:
${historyForPrompt || "(none)"}

Last scan context:
${lastDetection?.detectedDisease ? JSON.stringify(lastDetection) : "(none)"}

User question:
${message}

Knowledge for use:
${knowledgeForPrompt}
`.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    // Merge system instruction into prompt for better compatibility across SDK versions
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const completion = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: { temperature: 0.25, maxOutputTokens: 800 },
    });

    const aiText = completion.response.text().trim();
    if (!aiText) {
      console.warn("Gemini returned empty response, falling back.");
      return formatDisease();
    }
    return aiText;
  } catch (err) {
    console.error("Chat LLM error:", err.message);
    return formatDisease();
  }
};

module.exports = {
  detectDisease,
  getModelStatus,
  chatWithKnowledge,
};