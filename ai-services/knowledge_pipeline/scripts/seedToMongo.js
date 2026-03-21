const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const structuredDir = path.join(__dirname, "../data/structured");

console.log("Structured directory:", structuredDir);

// Get JSON files
const files = fs.readdirSync(structuredDir).filter((f) => f.endsWith(".json"));
console.log("JSON files found:", files);

// MongoDB config
const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGO_DB || "agri-clinic-hub-test";
const collectionName = "diseases";
const batchSize = Number(process.env.SEED_BATCH_SIZE || 200);

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Read all JSON files
    const records = files.map((file) =>
      JSON.parse(fs.readFileSync(path.join(structuredDir, file), "utf-8")),
    );

    let inserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const ops = batch.map((doc) => ({
        updateOne: {
          filter: { modelName: doc.modelName },
          update: { $set: doc },
          upsert: true,
        },
      }));

      if (!ops.length) continue;

      await collection.bulkWrite(ops, { ordered: false });
      inserted += ops.length;
    }

    console.log(`Seed complete. Upserted documents: ${inserted}`);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

seed();
