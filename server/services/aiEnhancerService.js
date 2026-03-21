const OpenAI = require("openai");
const { querySimilarDiseases } = require("./embeddingService");
const redis = require("../utils/redisClient");
const { safeParseAI } = require("../utils/aiParser");
const Disease = require("../models/Diseases");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function enhanceWithRAG(data) {
  const safeCrop = String(data.crop || "unknown").replace(/\s+/g, "_").slice(0, 60);
  const safeSeverity = String(data.severity || "unknown").replace(/\s+/g, "_").slice(0, 20);
  const safeDisease = String(data.detectedDisease || "unknown").replace(/\s+/g, "_").slice(0, 80);
  const cacheKey = `rag:${safeDisease}:${safeCrop}:${safeSeverity}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Step 1: Retrieve top 5 similar diseases from embeddings (if available)
  let similar = [];
  const ragSkipKey = "rag:skipEmbedding";
  const skipEmbedding = await redis.get(ragSkipKey);

  if (!skipEmbedding) {
  try {
    similar = await querySimilarDiseases(data.detectedDisease, 5);
  } catch (err) {
    // If Pinecone/OpenAI embeddings aren't available yet, we still want
    // a decent answer based on the disease we already have.
    console.warn("RAG retrieval failed; falling back to direct disease context:", err.message);

    const msg = String(err?.message || err || "");
    if (msg.includes("429") || msg.toLowerCase().includes("quota")) {
      // Avoid hammering the embeddings endpoint repeatedly.
      await redis.set(ragSkipKey, "1", "EX", 60 * 60);
    }
  }
  }

  const cleanArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(v => v && typeof v === "string" && v.toLowerCase() !== "undefined" && v.toLowerCase() !== "null" && v.trim() !== "");
  };

  const fallbackContextText = () => {
    const description = data.description || "";
    const symptoms = cleanArray(data.symptoms).slice(0, 10).join("; ");
    const prevention = cleanArray(data.prevention).slice(0, 12).join("; ");
    const organic = cleanArray(data.organicTreatment).slice(0, 12).join("; ");
    const chemical = cleanArray(data.chemicalTreatment).slice(0, 12).join("; ");

    const parts = [
      description ? `Description: ${description}` : null,
      symptoms ? `Symptoms: ${symptoms}` : null,
      organic ? `Organic treatments: ${organic}` : null,
      chemical ? `Chemical treatments: ${chemical}` : null,
      prevention ? `Prevention: ${prevention}` : null,
      data.crop ? `Crop: ${data.crop}` : null,
      data.severity ? `Severity: ${data.severity}` : null,
    ].filter(Boolean);

    return parts.join("\n").slice(0, 1400);
  };

  const parseDiseaseIdFromMatch = (match) => {
    const raw =
      match?.metadata?.diseaseId ||
      match?.id ||
      match?.metadata?.disease_id ||
      null;
    if (!raw) return null;

    // New ingestion uses: `${diseaseId}::chunk-${idx}`
    // Old ingestion may use just `${diseaseId}`.
    return String(raw).split("::")[0].split("-chunk-")[0];
  };

  const diseaseIds = Array.from(
    new Set(similar.map(parseDiseaseIdFromMatch).filter(Boolean))
  );

  const displayNames = Array.from(
    new Set(
      similar
        .map((m) => m?.metadata?.displayName)
        .filter((v) => typeof v === "string" && v.trim().length > 0)
    )
  );

  const diseaseById = {};
  if (diseaseIds.length > 0) {
    const docs = await Disease.find({ _id: { $in: diseaseIds } })
      .lean()
      .limit(10);
    for (const doc of docs) {
      diseaseById[String(doc._id)] = doc;
    }
  }

  const diseaseByDisplayName = {};
  if (displayNames.length > 0) {
    const docs = await Disease.find({
      $or: [
        { displayName: { $in: displayNames } },
        { modelName: { $in: displayNames } },
      ],
    })
      .lean()
      .limit(10);
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
      const diseaseDoc = diseaseId
        ? diseaseById[String(diseaseId)]
        : diseaseByDisplayName[String(displayName)] || null;

      const snippetFromVector =
        match?.metadata?.snippet ||
        match?.metadata?.description ||
        "";

      const cleanArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.filter(v => v && typeof v === "string" && v.toLowerCase() !== "undefined" && v.toLowerCase() !== "null" && v.trim() !== "");
      };
      
      const snippetFromMongo = diseaseDoc
        ? [
            diseaseDoc.description,
            cleanArray(diseaseDoc.symptoms).length
              ? `Symptoms: ${cleanArray(diseaseDoc.symptoms)
                  .slice(0, 8)
                  .join("; ")}`
              : null,
            cleanArray(diseaseDoc.prevention).length
              ? `Prevention: ${cleanArray(diseaseDoc.prevention)
                  .slice(0, 8)
                  .join("; ")}`
              : null,
          ]
            .filter(Boolean)
            .join("\n")
            .slice(0, 900)
        : "";

      const snippet = (snippetFromVector || snippetFromMongo || "").trim();
      return `${displayName} (${crop}): ${snippet}`.trim();
        })
        .join("\n")
    : fallbackContextText();

  const prompt = `
You are an agricultural AI assistant. Use the following disease context to provide:
- extra advice
- warnings
- best practices

Return ONLY valid JSON.

Context:
${contextText}

Detected Disease: ${data.detectedDisease}
Crop: ${data.crop}
Severity: ${data.severity}
Existing Treatments: ${(data.organicTreatment || []).concat(data.chemicalTreatment || []).join("\n")}
Prevention: ${(data.prevention || []).join("\n")}
`;

  for (let i = 0; i < 2; i++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      });

      const parsed = safeParseAI(response.choices[0].message.content);
      if (parsed) {
        await redis.set(cacheKey, JSON.stringify(parsed), "EX", 86400);
        return parsed;
      }
    } catch (err) {
      console.error("RAG AI Retry Error:", err.message);
    }
  }

  return null;
}

module.exports = { enhanceWithRAG };
