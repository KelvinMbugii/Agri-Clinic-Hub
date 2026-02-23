import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const structuredDir = path.join(__dirname, "../data/structured");

console.log("Structured directory:", structuredDir);

const files = fs.readdirSync(structuredDir).filter(f => f.endsWith(".json"));

console.log("JSON files found:", files);

const uri = "mongodb://localhost:27017";
const dbName = "agri-clinic-hub-test";
const collectionName = "diseases";

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    for (const file of files) {
      const data = JSON.parse(
        fs.readFileSync(path.join(structuredDir, file), "utf-8")
      );

      await collection.insertOne(data);
      console.log("Inserted:", data.name);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

seed();