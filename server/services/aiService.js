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
// };

// module.exports = {
//   detectDisease,
//   getModelStatus,
//   chatWithKnowledge,
// };

const axios = require("axios");
const FormData = require("form-data");
const Disease = require("../models/Diseases");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { enhanceWithRAG } = require("./aiEnhancerService");
const { querySimilarDiseases } = require("./embeddingService");

const AI_SERVICE_URL = "http://localhost:8000/predict";
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

    // 3️⃣ Low confidence guard
    if ((confidence || 0) < 0.7) {
      return {
        detectedDisease: aiDiseaseName,
        confidenceScore: Math.round(confidence || 0),
        message: "Low confidence. Please upload a clearer image.",
        source: "python-fastapi",
      };
    }

    // 4️⃣ Fetch disease info from MongoDB
    const diseaseInfo = await findDiseaseRecord(aiDiseaseName);

    // 5️⃣ If no DB match, return basic response + RAG AI enhancement
    if (!diseaseInfo) {
      const baseResponse = {
        detectedDisease: aiDiseaseName,
        confidenceScore: Math.round(confidence || 0),
        severity: "unknown",
        crop: "unknown",
        source: "python-fastapi",
      };

      const aiEnhancement = await enhanceWithRAG(baseResponse);

      return { ...baseResponse, aiInsights: aiEnhancement || {} };
    }

    // 6️⃣ Build base response from DB
    const baseResponse = {
      detectedDisease: diseaseInfo.displayName,
      confidenceScore: Math.round(confidence || 0),
      description: diseaseInfo.description,
      organicTreatment: diseaseInfo.treatment?.organic || [],
      chemicalTreatment: diseaseInfo.treatment?.chemical || [],
      prevention: diseaseInfo.prevention || [],
      severity: diseaseInfo.severity,
      crop: diseaseInfo.crop,
      source: "python-fastapi",
    };

    // 7️⃣ Skip AI if DB data already sufficient
    const hasEnoughData =
      baseResponse.organicTreatment.length && baseResponse.prevention.length;

    if (hasEnoughData) return baseResponse;

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
  const results = await Disease.find(
    { $text: { $search: message } },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(1);

  return results[0] || null;
};

/**
 * Find a disease by embedding similarity (Pinecone) then fetch from Mongo.
 * Requires that embeddings have been ingested into the vector index.
 */
const findDiseaseByEmbedding = async (query) => {
  const matches = await querySimilarDiseases(query, 3);
  if (!matches || matches.length === 0) return null;

  // Pinecone match.id should be the vector id we used on upsert.
  // We embed vectors per disease record, so `id` may include chunk suffix.
  const candidateId = matches[0]?.id;
  if (!candidateId) return null;

  // If your vector ids are like `${diseaseId}::chunk-0`, strip the suffix.
  const diseaseId = String(candidateId).split("::")[0].split("-chunk-")[0];
  if (!diseaseId) return null;

  return Disease.findById(diseaseId);
};

/**
 * Chat-based knowledge response
 */
const chatWithKnowledge = async (
  message,
  { lastDetection = {}, chatHistory = [] } = {}
) => {
  const recentTurns = Array.isArray(chatHistory) ? chatHistory.slice(-10) : [];
  const recentUserText = recentTurns
    .filter((m) => m?.sender === "user" && typeof m.text === "string")
    .map((m) => m.text)
    .slice(-6)
    .join("\n");

  const combinedQuery = [recentUserText, message, lastDetection?.detectedDisease]
    .filter(Boolean)
    .join("\n");

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
  
  // Helper to sanitize arrays, remove duplicates, and filter out scraper garbage
  const cleanArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    
    // Garbage phrases that appear in bulk from scraping
    const garbagePhrases = [
      "vegetable disease and symptoms", 
      "cultural controls chemical",
      "best efforts at prevention",
      "common diseases (see mu extension",
      "by following disease prevention",
      "the following table describes some of the common diseases"
    ];

    const uniqueArr = [...new Set(arr)];
    return uniqueArr
      .filter(v => v && typeof v === "string" && v.toLowerCase() !== "undefined" && v.toLowerCase() !== "null" && v.trim().length > 3)
      .filter(v => !garbagePhrases.some(g => v.toLowerCase().includes(g)))
      .map(v => v.trim());
  };

  // Fallback: deterministic explanation if LLM fails.
  const formatDisease = () => {
    const lines = [];
    const displayName = cleanStr(diseaseInfo.displayName);
    const crop = cleanStr(diseaseInfo.crop);
    const type = cleanStr(diseaseInfo.type);
    const severity = cleanStr(diseaseInfo.severity);

    if (displayName === "Unknown") {
      lines.push(`I found some general farming guidelines for your query in our database.`);
    } else {
      lines.push(`Here is what I found regarding **${displayName}**.`);
    }
    
    lines.push("");

    const details = [];
    if (crop !== "Unknown") details.push(`🌱 **Crop:** ${crop}`);
    if (type !== "Unknown") details.push(`🦠 **Type:** ${type}`);
    if (severity !== "Unknown") details.push(`⚠️ **Severity:** ${severity}`);

    if (details.length > 0) {
      lines.push(details.join("  |  "));
      lines.push("");
    }

    const symptoms = cleanArray(diseaseInfo.symptoms);
    if (symptoms.length) {
      lines.push("**Key Symptoms:**");
      lines.push(...symptoms.map((s) => `- ${s}`));
      lines.push("");
    }

    const cultural = cleanArray(diseaseInfo.treatment?.cultural);
    const chemical = cleanArray(diseaseInfo.treatment?.chemical);
    const organic = cleanArray(diseaseInfo.treatment?.organic);

    if (organic.length || chemical.length || cultural.length) {
      lines.push("**Recommended Treatments:**");
      if (organic.length) {
        lines.push("- *Organic:* " + organic.join(", "));
      }
      if (chemical.length) {
        lines.push("- *Chemical:* " + chemical.join(", "));
      }
      if (cultural.length) {
        lines.push("- *Cultural:* " + cultural.join(", "));
      }
      lines.push("");
    }

    const prevention = cleanArray(diseaseInfo.prevention);
    if (prevention.length) {
      lines.push("**Prevention Tips:**");
      lines.push(...prevention.map((p) => `- ${p}`));
      lines.push("");
    }
    
    // Add a professional sign-off if we are falling back
    lines.push("*Note: This is an automated summary. If your crop looks severely infected, consider consulting a local agricultural officer.*");

    return lines.join("\n").trim();
  };

  if (!diseaseInfo && (!pineconeMatches || pineconeMatches.length === 0)) {
    return [
      "I could not confidently match that to a known disease or document guideline.",
      "Please tell me: crop name, growth stage, and the top 3 visible symptoms (leaf spots, yellowing, wilting, mold, etc.).",
      lastDetection?.detectedDisease
        ? `If you meant your last scan (${lastDetection.detectedDisease}), ask: “What should I do next?”`
        : "If you have an image, upload it for better accuracy.",
    ].join("\n");
  }

  try {
    const historyForPrompt = recentTurns
      .map((m) => `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`)
      .join("\n");

    let knowledgeForPrompt = "";

    if (diseaseInfo) {
      knowledgeForPrompt += `
[STRUCTURED DB MATCH]
Disease: ${cleanStr(diseaseInfo.displayName)}
Crop: ${cleanStr(diseaseInfo.crop)}
Type: ${cleanStr(diseaseInfo.type)}
Severity: ${cleanStr(diseaseInfo.severity)}
Description: ${cleanStr(diseaseInfo.description)}
Symptoms: ${cleanArray(diseaseInfo.symptoms).join("; ")}
Treatments (organic): ${cleanArray(diseaseInfo.treatment?.organic).join("; ")}
Treatments (chemical): ${cleanArray(diseaseInfo.treatment?.chemical).join("; ")}
Treatments (cultural): ${cleanArray(diseaseInfo.treatment?.cultural).join("; ")}
Prevention: ${cleanArray(diseaseInfo.prevention).join("; ")}
\n`.trim();
    }

    if (pineconeMatches && pineconeMatches.length > 0) {
      knowledgeForPrompt += "\n\n[RELEVANT SEMANTIC DOCUMENT CHUNKS]\n";
      pineconeMatches.forEach((match, idx) => {
        if (match.metadata.type === "document") {
          knowledgeForPrompt += `--- SOURCE DOCUMENT: ${match.metadata.sourceDocument || 'Unknown'} ---\n${match.metadata.snippet}\n\n`;
        } else if (match.metadata.type === "disease_schema" && !diseaseInfo) {
          // Only inject schema RAG if we didn't already text-match perfectly
          knowledgeForPrompt += `--- ENCYCLOPEDIA RECORD: ${match.metadata.displayName || 'Unknown'} (${match.metadata.crop || 'Unknown'}) ---\n${match.metadata.snippet}\n\n`;
        }
      });
    }

    const systemPrompt = `
You are a warm, professional, and highly knowledgeable Agricultural Extension Officer. 

### **Core Instructions:**
1. **Directness:** **DO NOT** repeat greetings like "Hello again" or "Thanks for reaching out" if you have already greeted the user in the conversation history. Get straight to the facts.
2. **Knowledge Priority:** 
   - First, use the provided "[STRUCTURED DB MATCH]" and "[RELEVANT SEMANTIC DOCUMENT CHUNKS]".
   - If those are empty or don't answer the question, use your **general agricultural knowledge** to provide a helpful, safe response. In this case, clarify that these are general agricultural best practices.
3. **Format:** Use bold headers and bullet points. Structure your advice into:
   - **🔍 Analysis:** What the problem is.
   - **✅ Action Plan:** Practical steps to take.
   - **🛡 Prevention:** Future protection.
4. **Safety:** Always include safety warnings for chemical handling.
5. **Tone:** Professional, expert, and brief. No fluff.

**CRITICAL:** Provide a substantive answer. Do not just say you are here to help; actually provide the information requested.
`.trim();

    const userPrompt = `
Conversation history (most recent first):
${historyForPrompt || "(none)"}

Last scan context (if any):
${lastDetection?.detectedDisease ? JSON.stringify(lastDetection) : "(none)"}

User question:
${message}

Knowledge you can use:
${knowledgeForPrompt}
`.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const completion = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.3, maxOutputTokens: 650 }
    });

    return completion.response.text().trim() || formatDisease();
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