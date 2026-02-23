const mongoose = require("mongoose");

// MongoDB connection
const uri = "mongodb://localhost:27017/agri-clinic-hub-test"; 

// Disease schema (matches your new schema)
const diseaseSchema = new mongoose.Schema({
  modelName: String,
  displayName: String,
  crop: String,
  description: String,
  symptoms: [String],
  type: String,
  severity: String,
  spreadRisk: String,
  treatment: {
    chemical: [String],
    organic: [String],
    cultural: [String],
  },
  prevention: [String],
  yieldImpactPercentage: Number,
  recommendedFertilizers: [String],
  recoveryTimeDays: Number,
  confidenceThreshold: Number,
  source: {
    name: String,
    url: String,
    verified: Boolean,
  },
}, { collection: "diseases" });

const Disease = mongoose.model("Disease", diseaseSchema);

// Generic function to query any disease
async function queryDisease(farmerMessage) {
  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  // Extract keywords from the message
  const keywords = farmerMessage
    .toLowerCase()
    .split(" ")
    .filter((w) => w.length > 2);

  // Build regex OR queries for partial matching
  const orQueries = keywords.map(k => ({
    $or: [
      { displayName: { $regex: k, $options: "i" } },
      { description: { $regex: k, $options: "i" } },
      { crop: { $regex: k, $options: "i" } },
      { symptoms: { $regex: k, $options: "i" } },
    ]
  }));

  const disease = await Disease.findOne({ $or: orQueries });

  if (disease) {
    console.log("🌾 Disease found:", disease.displayName);
    console.log("Crop:", disease.crop);
    console.log("Type:", disease.type);
    console.log("Severity:", disease.severity);
    console.log("Symptoms:", disease.symptoms.join(", "));
    console.log("Cultural treatments:", disease.treatment.cultural.join(", "));
    console.log("Prevention methods:", disease.prevention.join(", "));
    if (disease.treatment.chemical.length > 0) {
      console.log("Chemical treatments:", disease.treatment.chemical.join(", "));
    }
    if (disease.treatment.organic.length > 0) {
      console.log("Organic treatments:", disease.treatment.organic.join(", "));
    }
    console.log("Source:", disease.source.name, "-", disease.source.url);
  } else {
    console.log("⚠ No disease found for this message");
  }

  await mongoose.disconnect();
  console.log("✅ Disconnected from MongoDB");
}

// Example usage
queryDisease("I found moldy maize grains in storage"); // Aflatoxin
// queryDisease("Maize leaves with chlorotic mottling and necrosis"); // MLND