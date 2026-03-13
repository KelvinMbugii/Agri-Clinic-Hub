const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// -----------------------------
// Directories
// -----------------------------
const structuredDir = path.join(__dirname, "../data/structured");
const reportsDir = path.join(__dirname, "../data/reports");

console.log("Structured directory:", structuredDir);
console.log("Reports directory:", reportsDir);

// Get all JSON files in structuredDir
const files = fs.readdirSync(structuredDir).filter((f) => f.endsWith(".json"));
console.log("Structured JSON files found:", files);

// -----------------------------
// MongoDB config
// -----------------------------
const uri = "mongodb://localhost:27017";
const dbName = "agri-clinic-hub-test";
const collectionName = "diseases";

// -----------------------------
// Generate modelName if missing
// -----------------------------
function generateModelName(file, disease) {
  const base = disease ? disease.replace(/\s+/g, "_") : "unknown";
  const name = `${base}_${path.basename(file, ".json")}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");
  return name;
}

// -----------------------------
// Seed function
// -----------------------------
async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(structuredDir, file), "utf-8"));

      // Ensure modelName exists
      if (!data.modelName) {
        data.modelName = generateModelName(file, data.disease);
        console.warn(`⚠ modelName missing in ${file}, generated: ${data.modelName}`);
      }

      // -----------------------------
      // Attach report content if exists
      // -----------------------------
      const reportFileName = file.replace(".json", "_report.txt");
      const reportPath = path.join(reportsDir, reportFileName);

      if (fs.existsSync(reportPath)) {
        const reportContent = fs.readFileSync(reportPath, "utf-8");
        data.report = reportContent; // add report field
        console.log(`📄 Report attached for ${data.modelName}`);
      }

      // Upsert to avoid duplicate key errors
      await collection.updateOne(
        { modelName: data.modelName },
        { $set: data },
        { upsert: true }
      );

      console.log("Inserted/Updated:", data.modelName);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Run seeding
seed();