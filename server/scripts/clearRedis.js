require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const redis = require("../utils/redisClient");

async function clearCache() {
  try {
    console.log("Clearing Upstash Redis cache...");
    await redis.flushdb();
    console.log("✅ Cache successfully cleared!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to clear cache:", err.message);
    process.exit(1);
  }
}

clearCache();
