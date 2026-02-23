const fs = require("fs");
const path = require("path");

// Use the new class-based API
const { PDFParse } = require("pdf-parse");

const rawDir = path.join(__dirname, "../data/raw");
const extractedDir = path.join(__dirname, "../data/extracted");

if (!fs.existsSync(extractedDir)) {
  fs.mkdirSync(extractedDir, { recursive: true });
}

const files = fs.readdirSync(rawDir).filter((f) => f.endsWith(".pdf"));

console.log("PDF files found:", files);

(async () => {
  for (const file of files) {
    try {
      const dataBuffer = fs.readFileSync(path.join(rawDir, file));

      // Create parser instance
      const parser = new PDFParse({ data: dataBuffer });

      // Extract text using the new API
      const result = await parser.getText();

      const outputFile = path.join(
        extractedDir,
        file.replace(".pdf", "_raw.txt")
      );

      fs.writeFileSync(outputFile, result.text);

      console.log(`Extracted: ${file}`);
    } catch (err) {
      console.error(`Failed to extract ${file}:`, err.message);
    }
  }
})();