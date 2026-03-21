/* eslint-disable no-console */
require("dotenv").config();

const { Pinecone } = require("@pinecone-database/pinecone");

async function main() {
  const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME || "disease-embeddings";
  const namespace = process.env.PINECONE_NAMESPACE || "";

  if (!PINECONE_API_KEY) throw new Error("Missing PINECONE_API_KEY in .env");

  const pinecone = new Pinecone({
    apiKey: PINECONE_API_KEY,
    controllerHostUrl: process.env.PINECONE_CONTROLLER_HOST,
  });

  const all = await pinecone.listIndexes();
  const visibleNames = (all?.indexes || []).map((x) => x.name);

  console.log("Pinecone indexes visible to this API key:", visibleNames);
  if (!visibleNames.includes(indexName)) {
    console.log(
      `Index "${indexName}" not found in the accessible project. Update PINECONE_INDEX_NAME or use the correct API key/controller host.`
    );
    process.exit(0);
  }

  const index = pinecone.index({ name: indexName });

  const stats = await index.describeIndexStats();

  // Shape depends on Pinecone version; handle the common fields.
  const namespaceToCheck = namespace || "__default__";
  const namespaceStats =
    stats?.namespaces && namespaceToCheck in stats.namespaces
      ? stats.namespaces[namespaceToCheck]
      : null;

  console.log("Pinecone index stats:");
  console.log({
    indexName,
    namespace: namespace || "__default__",
    dimension: stats?.dimension,
    totalVectorCount: stats?.totalVectorCount || stats?.totalRecordCount,
    namespaceVectorCount: namespaceStats?.vectorCount || namespaceStats?.recordCount,
    namespacesPresent: stats?.namespaces ? Object.keys(stats.namespaces) : [],
  });
}

main().catch((err) => {
  console.error("Failed to load Pinecone stats:", err?.message || err);
  process.exit(1);
});

