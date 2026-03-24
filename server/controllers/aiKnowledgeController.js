const Disease = require("../models/Diseases");
const KnowledgeFragment = require("../models/KnowledgeFragment");
const { upsertDiseaseEmbedding, upsertKnowledgeFragmentEmbedding, chunkText } = require("../services/embeddingService");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { parseGenericJson } = require("../utils/aiParser");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @route POST /api/ai/knowledge
 * @desc Add a new disease record to MongoDB for the AI pipeline
 * @access Private/Admin
 */
exports.addDiseaseKnowledge = async (req, res) => {
  try {
    const {
      modelName,
      displayName,
      crop,
      description,
      symptoms,
      type,
      severity,
      spreadRisk,
      treatment,
      prevention,
    } = req.body;

    // Validate required fields
    if (!modelName || !displayName || !crop || !description || !type || !severity) {
      return res.status(400).json({ message: "Missing required core fields." });
    }

    const newDisease = new Disease({
      modelName,
      displayName,
      crop,
      description,
      symptoms: symptoms || [],
      type,
      severity,
      spreadRisk: spreadRisk || "medium",
      treatment: {
        chemical: treatment?.chemical || [],
        organic: treatment?.organic || [],
        cultural: treatment?.cultural || [],
      },
      prevention: prevention || [],
    });

    await newDisease.save();
    res.status(201).json({ message: "Disease knowledge added successfully", disease: newDisease });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Disease modelName already exists." });
    }
    console.error("Failed to add AI knowledge:", err.message);
    res.status(500).json({ message: "Server error while saving disease data" });
  }
};

/**
 * @route POST /api/ai/retrain
 * @desc Informs Pinecone to re-ingest all active disease vectors
 * @access Private/Admin
 */
exports.retrainModel = async (req, res) => {
  try {
    // We send an early response because embedding can take a long time on large sets.
    res.status(202).json({ message: "AI retraining initiated. This may take a few minutes." });

    // Background process for generating embeddings
    (async () => {
      try {
        console.log("Admin initiated Pinecone retraining task...");
        let processed = 0;
        const cursor = Disease.find({})
          .select("_id displayName crop description symptoms type severity treatment prevention")
          .lean()
          .cursor();

        for await (const disease of cursor) {
          // Send back to the embeddingService with standard internal chunk sizes.
          await upsertDiseaseEmbedding(disease, { chunkCharLimit: 2000 });
          processed += 1;
        }

        console.log(`Retraining complete! Total vectors upserted: ${processed}`);
      } catch (ingestErr) {
        console.error("Retraining background task failed:", ingestErr.message);
      }
    })();
  } catch (err) {
    console.error("Failed to trigger retrain:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error triggering AI retraining" });
    }
  }
};

/**
 * @route POST /api/ai/extract-knowledge
 * @desc Extracts structured JSON from raw text using Gemini and seeds MongoDB
 * @access Private/Admin
 */
exports.extractAndSeedKnowledge = async (req, res) => {
  try {
    const { rawText, extractData = true } = req.body;
    if (!rawText || rawText.length < 20) {
      return res.status(400).json({ message: "Please provide a valid block of agricultural text." });
    }

    if (String(extractData) === "false") {
      // Direct raw semantic chunking
      const chunks = chunkText(rawText, 2000);
      let totalIngested = 0;
      for (const piece of chunks) {
        const frag = new KnowledgeFragment({
          sourceDocument: "Admin Text Input",
          textChunk: piece,
          type: "document"
        });
        await frag.save();
        await upsertKnowledgeFragmentEmbedding(frag);
        totalIngested++;
      }
      return res.status(201).json({ message: `Successfully chunked and ingested ${totalIngested} semantic paragraphs into RAG Storage!` });
    }

    const prompt = `
You are an expert agricultural data extractor. Extract the disease or pest guidelines from the following raw text and transform it into EXACTLY this JSON schema.
If the text describes MULTIPLE diseases, return an ARRAY of objects matching this schema. If it describes ONE, return a single object.
Ensure arrays are split logically. If a field is not mentioned, use "unknown" or an empty array.
If the text describes a general crop issue rather than a specific disease, invent a descriptive "modelName" (e.g. "tomato_calcium_deficiency").

{
  "modelName": "unique_snake_case_id",
  "displayName": "Readable Name",
  "crop": "Crop Name",
  "description": "Short summary",
  "type": "fungal" | "bacterial" | "viral" | "nutrient_deficiency" | "pest" | "healthy",
  "severity": "low" | "medium" | "high",
  "spreadRisk": "low" | "medium" | "high",
  "symptoms": ["symptom 1"],
  "treatment": {
    "chemical": ["chem 1"],
    "organic": ["org 1"],
    "cultural": ["cult 1"]
  },
  "prevention": ["prev 1"]
}

RAW TEXT:
${rawText}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const completion = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: "Return ONLY valid JSON matching the exact schema provided.",
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    });

    const parsed = parseGenericJson(completion.response.text());
    if (!parsed) {
      console.error("Gemini invalid JSON payload:", completion.response.text());
      return res.status(500).json({ message: "AI failed to extract valid structured JSON." });
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];
    const savedDiseases = [];
    const skipped = [];

    for (const item of items) {
      if (!item.modelName) continue;
      
      const existing = await Disease.findOne({ modelName: item.modelName });
      if (existing) {
        skipped.push(item.modelName);
        continue;
      }

      // Sanitize strict Mongoose Enums
      const validTypes = ["fungal", "bacterial", "viral", "nutrient_deficiency", "pest", "healthy"];
      if (!validTypes.includes(item.type)) item.type = "healthy";

      const validRiskLevels = ["low", "medium", "high"];
      if (!validRiskLevels.includes(item.severity)) item.severity = "medium";
      if (!validRiskLevels.includes(item.spreadRisk)) item.spreadRisk = "medium";

      const newDisease = new Disease({
        ...item,
        symptoms: item.symptoms || [],
        treatment: {
          chemical: item.treatment?.chemical || [],
          organic: item.treatment?.organic || [],
          cultural: item.treatment?.cultural || [],
        },
        prevention: item.prevention || [],
      });
      await newDisease.save();
      savedDiseases.push(newDisease);
    }

    if (savedDiseases.length === 0) {
      return res.status(400).json({ 
        message: `Extracted ${items.length} records, but all already existed in the database (skipped: ${skipped.join(", ")}).` 
      });
    }
    
    res.status(201).json({ 
      message: `Successfully extracted and seeded ${savedDiseases.length} new records into MongoDB! (Skipped ${skipped.length} duplicates)`,
      diseases: savedDiseases 
    });

  } catch (err) {
    console.error("Extraction pipeline failed:", err.message);
    res.status(500).json({ message: "Server error during ETL pipeline." });
  }
};

/**
 * @route POST /api/ai/upload-knowledge
 * @desc Parses a PDF or TXT file, extracts JSON using Gemini, and seeds MongoDB
 * @access Private/Admin
 */
exports.uploadAndSeedKnowledge = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No document provided." });
    }

    const filePath = req.file.path;
    let rawText = "";

    try {
      if (req.file.mimetype === "application/pdf" || req.file.originalname.endsWith(".pdf")) {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        rawText = data.text;
      } else {
        rawText = fs.readFileSync(filePath, "utf8");
      }
    } finally {
      // Always securely clean up the temp file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({ message: "Could not extract sufficient text from the document." });
    }

    // Determine processing mode
    const extractFlag = req.body.extractData !== undefined ? req.body.extractData : req.body.extractData !== "false";
    const shouldExtract = String(extractFlag) !== "false";

    if (!shouldExtract) {
      // Direct raw semantic chunking
      console.log(`Bypassing Gemini extraction. Chunks raw PDF directly: ${req.file.originalname}`);
      const chunks = chunkText(rawText, 2000);
      let totalIngested = 0;
      for (const piece of chunks) {
        const frag = new KnowledgeFragment({
          sourceDocument: req.file.originalname,
          textChunk: piece,
          type: "document"
        });
        await frag.save();
        await upsertKnowledgeFragmentEmbedding(frag);
        totalIngested++;
      }
      return res.status(201).json({ message: `Successfully chunked ${req.file.originalname} and ingested ${totalIngested} semantic paragraphs into RAG Storage!` });
    }

    // Pass it exactly through the same AI extraction prompt
    const prompt = `
You are an expert agricultural data extractor. Extract the disease or pest guidelines from the following raw document text and transform it into EXACTLY this JSON schema.
If the document describes MULTIPLE diseases, return an ARRAY of objects matching this schema. If it describes ONE, return a single object.
Ensure arrays are split logically. If a field is not mentioned, use "unknown" or an empty array.
If the text describes a general crop issue rather than a specific disease, invent a descriptive "modelName" (e.g. "tomato_calcium_deficiency").

{
  "modelName": "unique_snake_case_id",
  "displayName": "Readable Name",
  "crop": "Crop Name",
  "description": "Short summary",
  "type": "fungal" | "bacterial" | "viral" | "nutrient_deficiency" | "pest" | "healthy",
  "severity": "low" | "medium" | "high",
  "spreadRisk": "low" | "medium" | "high",
  "symptoms": ["symptom 1"],
  "treatment": {
    "chemical": ["chem 1"],
    "organic": ["org 1"],
    "cultural": ["cult 1"]
  },
  "prevention": ["prev 1"]
}

RAW TEXT:
${rawText}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const completion = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: "Return ONLY valid JSON matching the exact schema provided.",
      generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
    });

    const parsed = parseGenericJson(completion.response.text());
    if (!parsed) {
      console.error("Gemini invalid JSON document payload:", completion.response.text());
      return res.status(500).json({ message: "AI failed to extract valid structured JSON from the document." });
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];
    const savedDiseases = [];
    const skipped = [];

    for (const item of items) {
      if (!item.modelName) continue;

      const existing = await Disease.findOne({ modelName: item.modelName });
      if (existing) {
        skipped.push(item.modelName);
        continue;
      }

      // Sanitize strict Mongoose Enums
      const validTypes = ["fungal", "bacterial", "viral", "nutrient_deficiency", "pest", "healthy"];
      if (!validTypes.includes(item.type)) item.type = "healthy";

      const validRiskLevels = ["low", "medium", "high"];
      if (!validRiskLevels.includes(item.severity)) item.severity = "medium";
      if (!validRiskLevels.includes(item.spreadRisk)) item.spreadRisk = "medium";

      const newDisease = new Disease({
        ...item,
        symptoms: item.symptoms || [],
        treatment: {
          chemical: item.treatment?.chemical || [],
          organic: item.treatment?.organic || [],
          cultural: item.treatment?.cultural || [],
        },
        prevention: item.prevention || [],
      });
      await newDisease.save();
      savedDiseases.push(newDisease);
    }

    if (savedDiseases.length === 0) {
      return res.status(400).json({ 
        message: `Parsed document, but all ${items.length} records already exist in the DB (skipped: ${skipped.join(", ")}).` 
      });
    }

    res.status(201).json({ 
      message: `Successfully extracted document and seeded ${savedDiseases.length} new records into MongoDB! (Skipped ${skipped.length} duplicates)`,
      diseases: savedDiseases 
    });

  } catch (err) {
    console.error("Document upload pipeline failed:", err.message);
    res.status(500).json({ message: `Server error during document ETL pipeline: ${err.message}` });
  }
};
