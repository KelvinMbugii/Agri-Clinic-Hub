const OpenAI = require("openai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { z } = require("zod");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Pinecone SDK v7 uses a different client API than older versions.
// We only need an API key here; the SDK will pick controller host from env (if set).
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  controllerHostUrl: process.env.PINECONE_CONTROLLER_HOST,
});

const VECTOR_INDEX = process.env.PINECONE_INDEX_NAME || "disease-embeddings";
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || ""; // empty string => default namespace

const EMBEDDING_MODEL = "text-embedding-3-small";
// Pinecone index stats showed dimension=1024. Your embedding generator must match that dimension.
const EMBEDDING_DIMENSION = Number(
  process.env.PINECONE_INDEX_DIMENSION || 1024
);
const CHUNK_CHAR_LIMIT = 2000;
const SNIPPET_CHAR_LIMIT = 650;

function chunkText(text = "", maxChars = CHUNK_CHAR_LIMIT) {
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  if (normalized.length <= maxChars) return [normalized];

  // Split on sentence-ish boundaries where possible.
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

// Validate embeddings structure
const embeddingSchema = z.object({
  id: z.string(),
  vector: z.array(z.number()).length(EMBEDDING_DIMENSION),
  metadata: z.object({
    displayName: z.string(),
    crop: z.string(),
    diseaseId: z.string(),
    snippet: z.string(),
  }),
});

async function embedText(text) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
    dimensions: EMBEDDING_DIMENSION,
  });
  return response.data[0].embedding;
}

async function embedTexts(texts, { batchSize = 64 } = {}) {
  const results = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSION,
    });

    // OpenAI returns embeddings with indices; keep ordering stable.
    const ordered = response.data.sort((a, b) => a.index - b.index);
    results.push(...ordered.map((d) => d.embedding));
  }

  return results;
}

async function upsertDiseaseEmbedding(
  disease,
  { chunkCharLimit = CHUNK_CHAR_LIMIT, snippetCharLimit = SNIPPET_CHAR_LIMIT } = {}
) {
  const diseaseId = disease._id.toString();
  const displayName = disease.displayName;
  const crop = disease.crop;

  const fullText = buildDiseaseEmbeddingText(disease);
  const chunks = chunkText(fullText, chunkCharLimit);

  const index = pinecone.index({ name: VECTOR_INDEX });

  // Embed chunk texts in batches for efficiency.
  const embeddings = await embedTexts(chunks);

  const records = embeddings.map((vector, idx) => {
    const chunkTextValue = chunks[idx] || "";
    const snippet = chunkTextValue.slice(0, snippetCharLimit);

    const parsed = embeddingSchema.parse({
      id: `${diseaseId}::chunk-${idx}`,
      vector,
      metadata: { displayName, crop, diseaseId, snippet },
    });

    return {
      id: parsed.id,
      values: parsed.vector,
      metadata: parsed.metadata,
    };
  });

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

module.exports = { embedText, upsertDiseaseEmbedding, querySimilarDiseases };
