const fs = require("fs");
const path = require("path");
const nlp = require("compromise");

// -----------------------------
// Directories
// -----------------------------
const extractedDir = path.join(__dirname, "../data/extracted");
const structuredDir = path.join(__dirname, "../data/structured");

// Ensure structured folder exists
if (!fs.existsSync(structuredDir)) fs.mkdirSync(structuredDir, { recursive: true });

// -----------------------------
// Crop and Disease Keyword Lists (expandable)
// -----------------------------
const crops = ["maize", "wheat", "rice", "groundnut", "tomato"];
const diseases = [
  "maize lethal necrosis",
  "mlnd",
  "aflatoxin contamination",
  "fusarium wilt",
  "powdery mildew",
];

// -----------------------------
// Utility functions
// -----------------------------
function normalize(text) {
  return text.replace(/\r/g, "").replace(/\n+/g, "\n").toLowerCase();
}

// NLP-based detection
function detectEntity(text, keywords) {
  const doc = nlp(text);
  const found = keywords.find((kw) => doc.has(kw));
  return found || "Unknown";
}

// Extract sentences containing keywords
function extractSentences(text, sectionKeywords) {
  const doc = nlp(text);
  const sentences = doc.sentences().out("array");
  return sentences
    .filter((s) =>
      sectionKeywords.some((kw) => s.toLowerCase().includes(kw.toLowerCase()))
    )
    .map((s) => s.trim());
}

// -----------------------------
// Process all cleaned files
// -----------------------------
const cleanedFiles = fs
  .readdirSync(extractedDir)
  .filter((f) => f.endsWith("_cleaned.txt"));

console.log("Cleaned files found:", cleanedFiles);

cleanedFiles.forEach((file) => {
  try {
    const raw = fs.readFileSync(path.join(extractedDir, file), "utf-8");
    const text = normalize(raw);

    const jsonData = {
      crop: detectEntity(text, crops),
      disease: detectEntity(text, diseases),
      symptoms: extractSentences(text, ["symptom", "signs", "manifestation"]),
      treatment: extractSentences(text, ["treatment", "control", "management"]),
      prevention: extractSentences(text, ["prevention", "avoidance", "mitigation"]),
      sourceFile: file,
    };

    const outputPath = path.join(
      structuredDir,
      file.replace("_cleaned.txt", ".json")
    );
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    console.log("✅ Structured JSON created:", outputPath);
  } catch (err) {
    console.error(`❌ Failed processing ${file}:`, err.message);
  }
});