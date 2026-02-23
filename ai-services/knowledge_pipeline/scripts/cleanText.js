const fs = require("fs");
const path = require("path");

const extractedDir = path.join(__dirname, "../data/extracted");

const files = fs
  .readdirSync(extractedDir)
  .filter((f) => f.endsWith("_raw.txt"));

console.log("Raw text files found:", files);

files.forEach((file) => {
  try {
    const rawPath = path.join(extractedDir, file);
    const raw = fs.readFileSync(rawPath, "utf-8");

    if (!raw.trim()) {
      console.log(`⚠ Skipped empty file: ${file}`);
      return;
    }

    const cleaned = raw
      .replace(/\n\s*\n/g, "\n")   // remove extra blank lines
      .replace(/page \d+/gi, "")   // remove page numbers
      .replace(/\r/g, "")           // remove carriage returns
      .replace(/ +/g, " ")         // normalize multiple spaces
      .trim();

    const outputFile = path.join(
      extractedDir,
      file.replace("_raw.txt", "_cleaned.txt")
    );

    fs.writeFileSync(outputFile, cleaned);

    console.log(` Cleaned: ${file}`);
  } catch (err) {
    console.error(`Failed to clean ${file}:`, err.message);
  }
});