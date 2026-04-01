const { GoogleGenerativeAI } = require("@google/generative-ai");
const { safeParseAI } = require("../utils/aiParser");
const Disease = require("../models/Diseases");
const { querySimilarDiseases } = require("./embeddingService");
const redis = require("../utils/redisClient");
const { cleanTreatmentArray, summarizeTreatmentsForPrompt } = require("../utils/treatmentUtils");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function enhanceWithRAG(data) {
  const safeCrop = String(data.crop || "unknown").replace(/\s+/g, "_").slice(0, 60);
  const safeSeverity = String(data.severity || "unknown").replace(/\s+/g, "_").slice(0, 20);
  const safeDisease = String(data.detectedDisease || "unknown").replace(/\s+/g, "_").slice(0, 80);
  const cacheKey = `rag:v2:${safeDisease}:${safeCrop}:${safeSeverity}`;
  const cached = await redis.get(cacheKey);
  if (cached) return typeof cached === "string" ? JSON.parse(cached) : cached;

  // Step 1: Retrieve similar diseases or document chunks
  let similar = [];
  const ragSkipKey = "rag:skipEmbedding";
  const skipEmbedding = await redis.get(ragSkipKey);

  if (!skipEmbedding) {
    try {
      similar = await querySimilarDiseases(data.detectedDisease, 5);
    } catch (err) {
      console.warn("RAG retrieval failed; falling back to basic context:", err.message);
      const msg = String(err?.message || err || "");
      if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
        await redis.set(ragSkipKey, "1", { ex: 3600 });
      }
    }
  }

  const fallbackContextText = () => {
    const description = data.description || "";
    // Use the new cleanup utility
    const symptoms = cleanTreatmentArray(data.symptoms).slice(0, 8).join("; ");
    const prevention = summarizeTreatmentsForPrompt(data.prevention, 6);
    const organic = summarizeTreatmentsForPrompt(data.organicTreatment, 6);
    const chemical = summarizeTreatmentsForPrompt(data.chemicalTreatment, 5);

    const parts = [
      description ? `Description: ${description}` : null,
      symptoms ? `Symptoms: ${symptoms}` : null,
      organic ? `Organic treatments: ${organic}` : null,
      chemical ? `Chemical treatments: ${chemical}` : null,
      prevention ? `Prevention: ${prevention}` : null,
      data.crop ? `Crop: ${data.crop}` : null,
      data.severity ? `Severity: ${data.severity}` : null,
    ].filter(Boolean);

    return parts.join("\n").slice(0, 1500);
  };

  const parseDiseaseIdFromMatch = (match) => {
    const raw = match?.metadata?.diseaseId || match?.id || match?.metadata?.disease_id || null;
    if (!raw) return null;
    return String(raw).split("::")[0].split("-chunk-")[0];
  };

  const diseaseIds = Array.from(new Set(similar.map(parseDiseaseIdFromMatch).filter(Boolean)));
  const displayNames = Array.from(new Set(similar.map((m) => m?.metadata?.displayName).filter((v) => typeof v === "string" && v.trim().length > 0)));

  const diseaseById = {};
  if (diseaseIds.length > 0) {
    const docs = await Disease.find({ _id: { $in: diseaseIds } }).lean().limit(8);
    for (const doc of docs) diseaseById[String(doc._id)] = doc;
  }

  const diseaseByDisplayName = {};
  if (displayNames.length > 0) {
    const docs = await Disease.find({ $or: [{ displayName: { $in: displayNames } }, { modelName: { $in: displayNames } }] }).lean().limit(8);
    for (const doc of docs) {
      if (doc?.displayName) diseaseByDisplayName[String(doc.displayName)] = doc;
    }
  }

  const contextText = similar.length
    ? similar
        .map((match) => {
          const displayName = match?.metadata?.displayName || "Unknown";
          const crop = match?.metadata?.crop || "Unknown";
          const diseaseId = parseDiseaseIdFromMatch(match);
          const diseaseDoc = diseaseId ? diseaseById[String(diseaseId)] : diseaseByDisplayName[String(displayName)] || null;

          const snippetFromVector = (match?.metadata?.snippet || match?.metadata?.description || "").trim();
          
          const snippetFromMongo = diseaseDoc
            ? [
                diseaseDoc.description,
                cleanTreatmentArray(diseaseDoc.symptoms).length ? `Symptoms: ${cleanTreatmentArray(diseaseDoc.symptoms).slice(0, 5).join("; ")}` : null,
                summarizeTreatmentsForPrompt(diseaseDoc.prevention, 5) ? `Prevention: ${summarizeTreatmentsForPrompt(diseaseDoc.prevention, 5)}` : null,
              ].filter(Boolean).join("\n").slice(0, 800)
            : "";

          const snippet = (snippetFromVector || snippetFromMongo || "").trim();
          return `${displayName} (${crop}): ${snippet}`.trim();
        })
        .join("\n")
    : fallbackContextText();

  const prompt = `
You are a warm, supportive, and expert Agricultural Extension Officer. 
Your goal is to guide a farmer through solving a crop problem with practical, easy-to-follow advice.

### **Core Instructions:**
1. **Simplify Technical Lists:** Do NOT list every chemical or complex dosage found in the context. 
2. **Prioritize:** Provide ONLY the top 2-3 most effective and practical actions.
3. **Action-Oriented:** Use simple language. Instead of "Apply mancozeb 80WP", say "Apply a recommended fungicide (like mancozeb) according to the label instructions."
4. **Safety:** Always mention that the farmer should wear protective gear and follow product labels.
5. **Tone:** Professional, encouraging, and brief.

### **JSON Requirements:**
Return ONLY valid JSON with exactly these keys:
{
  "description": "Short, supportive explanation of the disease in simple terms",
  "organicTreatment": ["Practical step 1", "Practical step 2"],
  "chemicalTreatment": ["Simplified treatment 1", "Simplified treatment 2"],
  "prevention": ["Simple prevention 1", "Simple prevention 2"]
}

Context for reference:
${contextText}

Detected Disease: ${data.detectedDisease}
Alternative Diagnoses: ${JSON.stringify(data.alternative_diagnoses || [])}
Uncertainty Flag: ${data.is_uncertain ? "Yes - Provide a more nuanced, tentative diagnosis" : "No"}
Crop: ${data.crop}
Severity: ${data.severity}
Existing Treatments in DB: ${summarizeTreatmentsForPrompt((data.organicTreatment || []).concat(data.chemicalTreatment || []), 10)}
`;

  for (let i = 0; i < 2; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const fullPrompt = `You are an Agricultural Extension Officer. Return ONLY valid JSON and ensure the advice is farmer-friendly.\n\n${prompt}`;
      const completion = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { 
          temperature: 0.15, 
          maxOutputTokens: 1200,
          responseMimeType: "application/json"
        },
      });
      
      const parsed = safeParseAI(completion.response.text());
      if (parsed) {
        await redis.set(cacheKey, JSON.stringify(parsed), { ex: 86400 });
        return parsed;
      }
    } catch (err) {
      console.error("RAG AI Retry Error:", err.message);
    }
  }

  return null;
}

module.exports = { enhanceWithRAG };
