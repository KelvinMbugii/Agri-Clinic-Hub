const fs = require("fs");
const path = require("path");

// -----------------------------
// Directories
// -----------------------------
const structuredDir = path.join(__dirname, "../data/structured");
const outputDir = path.join(__dirname, "../data/reports");

// Ensure output folder exists
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// -----------------------------
// Utility to format list fields
// -----------------------------
function formatList(title, items) {
  if (!items || !items.length) return ""; // skip empty
  return `💊 ${title}:\n- ${items.join("\n- ")}`;
}

// -----------------------------
// Generate reports
// -----------------------------
const files = fs.readdirSync(structuredDir).filter((f) => f.endsWith(".json"));
console.log("Structured JSON files found:", files);

files.forEach((file) => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(structuredDir, file), "utf-8"));

    const symptoms = data.symptoms && data.symptoms.length ? "- " + data.symptoms.join("\n- ") : "No data";
    const prevention = data.prevention && data.prevention.length ? "- " + data.prevention.join("\n- ") : "No data";

    const report = `
🌿 ${data.disease || "Unknown Disease"} 🟢 Crop: ${data.crop || "Unknown Crop"} 🧬 Type: ${data.type || "Unknown"} ⚠ Severity: ${data.severity || "Unknown"}

🔍 Symptoms:
${symptoms}

${formatList("Cultural Treatments", data.treatment?.cultural)}
${formatList("Chemical Treatments", data.treatment?.chemical)}
${formatList("Organic Treatments", data.treatment?.organic)}

🛡 Prevention:
${prevention}
`.trim();

    const outputFile = path.join(outputDir, file.replace(".json", "_report.txt"));
    fs.writeFileSync(outputFile, report);
    console.log("✅ Report created:", outputFile);
  } catch (err) {
    console.error(`❌ Failed to process ${file}:`, err.message);
  }
});