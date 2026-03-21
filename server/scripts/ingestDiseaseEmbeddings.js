/* eslint-disable no-console */
require("dotenv").config();

const connectDB = require("../config/db");
const Disease = require("../models/Diseases");
const { upsertDiseaseEmbedding } = require("../services/embeddingService");

async function main() {
  const limitArgIndex = process.argv.findIndex((a) => a === "--limit");
  const limit =
    limitArgIndex >= 0 ? Number(process.argv[limitArgIndex + 1] || 0) : 0;

  const chunkCharLimitArgIndex = process.argv.findIndex(
    (a) => a === "--chunkCharLimit"
  );
  const chunkCharLimit =
    chunkCharLimitArgIndex >= 0
      ? Number(process.argv[chunkCharLimitArgIndex + 1] || 2000)
      : 2000;

  if (Number.isNaN(chunkCharLimit) || chunkCharLimit < 300) {
    throw new Error("--chunkCharLimit must be a number >= 300");
  }

  await connectDB();

  let processed = 0;
  const cursor = Disease.find({})
    .select(
      "_id displayName crop description symptoms type severity treatment prevention"
    )
    .lean()
    .cursor();

  console.log("Starting Pinecone ingestion...");
  if (limit > 0) console.log(`Limit enabled: ${limit} diseases`);

  for await (const disease of cursor) {
    if (limit > 0 && processed >= limit) break;

    // The embedding service uses a fixed internal chunk size.
    // We still allow passing a chunk size now, but for a production setup
    // you may prefer wiring this through to embeddingService.
    // (We keep the param here for future compatibility.)
    await upsertDiseaseEmbedding(disease, { chunkCharLimit });

    processed += 1;
    if (processed % 10 === 0) console.log(`Processed ${processed} diseases...`);
  }

  console.log(`Pinecone ingestion complete. Total processed: ${processed}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Ingestion failed:", err?.message || err);
  process.exit(1);
});

