const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const extractedDir = path.join(__dirname, "../data/extracted");
const structuredDir = path.join(__dirname, "../data/structured");
const outputFile = path.join(structuredDir, "knowledge_documents.jsonl");
const chunkSize = Number(process.env.KNOWLEDGE_CHUNK_SIZE || 1400);
const chunkOverlap = Number(process.env.KNOWLEDGE_CHUNK_OVERLAP || 180);

if (!fs.existsSync(structuredDir)) {
  fs.mkdirSync(structuredDir, { recursive: true });
}

const cleanedFiles = fs
  .readdirSync(extractedDir)
  .filter((file) => file.endsWith("_cleaned.txt"));

const splitIntoChunks = (content, size, overlap) => {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + size, normalized.length);
    const text = normalized.slice(start, end).trim();
    if (text) chunks.push(text);
    if (end === normalized.length) break;
    start = Math.max(0, end - overlap);
  }

  return chunks;
};

const inferTags = (filename, content) => {
  const signature = `${filename} ${content}`.toLowerCase();
  const tags = [];

  if (signature.includes("aflatoxin")) tags.push("aflatoxin", "storage", "mycotoxin");
  if (signature.includes("mlnd") || signature.includes("lethal necrosis")) tags.push("mlnd", "viral");
  if (signature.includes("maize")) tags.push("maize");
  if (signature.includes("tomato")) tags.push("tomato");

  return [...new Set(tags)];
};

const toDocument = ({ file, chunk, index, tags }) => {
  const docId = crypto.createHash("sha1").update(`${file}:${index}:${chunk}`).digest("hex").slice(0, 16);

  return {
    id: `doc_${docId}`,
    sourceFile: file,
    chunkIndex: index,
    text: chunk,
    tags,
    metadata: {
      length: chunk.length,
      approximateTokens: Math.ceil(chunk.length / 4),
      generatedAt: new Date().toISOString(),
    },
  };
};

const lines = [];
let totalChunks = 0;

for (const file of cleanedFiles) {
  const fullPath = path.join(extractedDir, file);
  const content = fs.readFileSync(fullPath, "utf-8");
  if (!content.trim()) continue;

  const chunks = splitIntoChunks(content, chunkSize, chunkOverlap);
  const tags = inferTags(file, content.slice(0, 2000));

  chunks.forEach((chunk, index) => {
    lines.push(JSON.stringify(toDocument({ file, chunk, index, tags })));
    totalChunks += 1;
  });
}

fs.writeFileSync(outputFile, `${lines.join("\n")}\n`);

console.log(`Built knowledge JSONL: ${outputFile}`);
console.log(`Files processed: ${cleanedFiles.length}`);
console.log(`Document chunks generated: ${totalChunks}`);
console.log(`Chunk size / overlap: ${chunkSize}/${chunkOverlap}`);