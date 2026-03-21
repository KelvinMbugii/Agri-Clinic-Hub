const fs = require("fs");
const path = require("path");

// -----------------------------
// Directories
// -----------------------------
const extractedDir = path.join(__dirname, "../data/extracted");
const structuredDir = path.join(__dirname, "../data/structured");

// Ensure structured folder exists
if (!fs.existsSync(structuredDir)) fs.mkdirSync(structuredDir, { recursive: true });

// -----------------------------
// Utility: extract section from text
// -----------------------------
function extractSection(text, sectionName) {
  const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(\\n[A-Z ]{3,}:|$)`, "i");
  const match = text.match(regex);
  if (!match) return null;
  return match[1].replace(/\n+/g, " ").trim();
}

function splitSection(sectionText) {
  if (!sectionText) return [];
  return sectionText
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
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
    const text = raw.replace(/\r/g, "").trim();

    const jsonData = {
      crop: extractSection(text, "Crop") || "Unknown",
      disease: extractSection(text, "Disease") || "Unknown",
      symptoms: splitSection(extractSection(text, "Symptoms")),
      treatment: splitSection(extractSection(text, "Treatment")),
      prevention: splitSection(extractSection(text, "Prevention")),
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