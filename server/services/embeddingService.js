const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { z } = require("zod");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const VECTOR_INDEX = process.env.PINECONE_INDEX_NAME || "disease-embeddings";
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || ""; 

const EMBEDDING_DIMENSION = 1024; // Explicitly map to user's immutable Pinecone Index
const CHUNK_CHAR_LIMIT = 2000;
const SNIPPET_CHAR_LIMIT = 650;

function chunkText(text = "", maxChars = CHUNK_CHAR_LIMIT) {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  const parts = normalized.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = "";

  for (const part of parts) {
    const next = current ? `${current} ${part}` : part;
    if (next.length > maxChars && current) {
      chunks.push(current);
      current = part;
    } else {
      current = next;
    }
  }

  if (current) chunks.push(current);
  return chunks.length ? chunks : [normalized.slice(0, maxChars)];
}

function buildDiseaseEmbeddingText(disease = {}) {
  const pieces = [
    disease.description,
    Array.isArray(disease.symptoms) ? disease.symptoms.join("; ") : undefined,
    disease.treatment?.organic && Array.isArray(disease.treatment.organic)
      ? disease.treatment.organic.join("; ")
      : undefined,
    disease.treatment?.chemical && Array.isArray(disease.treatment.chemical)
      ? disease.treatment.chemical.join("; ")
      : undefined,
    disease.treatment?.cultural && Array.isArray(disease.treatment.cultural)
      ? disease.treatment.cultural.join("; ")
      : undefined,
    Array.isArray(disease.prevention) ? disease.prevention.join("; ") : undefined,
  ].filter(Boolean);

  return pieces.join("\n");
}

const embeddingSchema = z.object({
  id: z.string(),
  vector: z.array(z.number()).length(EMBEDDING_DIMENSION),
  metadata: z.object({
    displayName: z.string().optional(),
    crop: z.string().optional(),
    diseaseId: z.string().optional(),
    type: z.string().default("disease_schema"),
    sourceDocument: z.string().optional(),
    snippet: z.string(),
  }).passthrough(),
});

async function embedText(text) {
  const result = await embeddingModel.embedContent(text);
  let vector = result.embedding.values;
  
  if (vector.length < EMBEDDING_DIMENSION) {
    const padding = new Array(EMBEDDING_DIMENSION - vector.length).fill(0);
    vector = vector.concat(padding);
  } else if (vector.length > EMBEDDING_DIMENSION) {
    vector = vector.slice(0, EMBEDDING_DIMENSION);
  }
  
  return vector;
}

async function embedTexts(texts, { batchSize = 64 } = {}) {
  const results = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    // Construct requests format for batchEmbedContents
    const reqs = batch.map(t => ({
      content: { role: "user", parts: [{ text: t }] }
    }));
    
    const result = await embeddingModel.batchEmbedContents({ requests: reqs });
    
    const paddedVectors = result.embeddings.map(e => {
      let vector = e.values;
      if (vector.length < EMBEDDING_DIMENSION) {
        vector = vector.concat(new Array(EMBEDDING_DIMENSION - vector.length).fill(0));
      } else if (vector.length > EMBEDDING_DIMENSION) {
        vector = vector.slice(0, EMBEDDING_DIMENSION);
      }
      return vector;
    });
    
    results.push(...paddedVectors);
  }
  
  return results;
}

async function upsertDiseaseEmbedding(disease, { chunkCharLimit = CHUNK_CHAR_LIMIT, snippetCharLimit = SNIPPET_CHAR_LIMIT } = {}) {
  const diseaseId = disease._id.toString();
  const displayName = disease.displayName;
  const crop = disease.crop;

  const fullText = buildDiseaseEmbeddingText(disease);
  const chunks = chunkText(fullText, chunkCharLimit);

  const index = pinecone.index({ name: VECTOR_INDEX });

  const embeddings = await embedTexts(chunks);

  const records = embeddings.map((vector, idx) => {
    const chunkTextValue = chunks[idx] || "";
    const snippet = chunkTextValue.slice(0, snippetCharLimit);

    const parsed = embeddingSchema.parse({
      id: `${diseaseId}::chunk-${idx}`,
      vector,
      metadata: { displayName, crop, diseaseId, type: "disease_schema", snippet },
    });

    return {
      id: parsed.id,
      values: parsed.vector,
      metadata: parsed.metadata,
    };
  });

  if (records.length === 0) {
    console.warn(`Skipping Pinecone upsert for Disease ${diseaseId}: no text chunks generated.`);
    return;
  }

  await index.upsert({
    records,
    namespace: PINECONE_NAMESPACE || undefined,
  });
}

async function querySimilarDiseases(query, topK = 5) {
  const vector = await embedText(query);
  const index = pinecone.index({ name: VECTOR_INDEX });

  const result = await index.query({
    topK,
    vector,
    includeMetadata: true,
    namespace: PINECONE_NAMESPACE || undefined,
  });

  return result.matches || [];
}

async function upsertKnowledgeFragmentEmbedding(fragment) {
  const fragmentId = fragment._id.toString();
  const index = pinecone.index({ name: VECTOR_INDEX });

  const vector = await embedText(fragment.textChunk);
  const snippet = fragment.textChunk.slice(0, SNIPPET_CHAR_LIMIT);
  
  const parsed = embeddingSchema.parse({
    id: `frag::${fragmentId}`,
    vector,
    metadata: { 
      type: fragment.type, 
      snippet, 
      sourceDocument: fragment.sourceDocument || "Admin Upload" 
    },
  });

  if (!parsed.vector || parsed.vector.length === 0) return;

  await index.upsert({
    records: [
      { id: parsed.id, values: parsed.vector, metadata: parsed.metadata }
    ],
    namespace: PINECONE_NAMESPACE || undefined,
  });
}

module.exports = { embedText, chunkText, upsertDiseaseEmbedding, upsertKnowledgeFragmentEmbedding, querySimilarDiseases };
