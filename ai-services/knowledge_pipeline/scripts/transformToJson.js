const fs = require("fs");
const path = require("path");

// Directories
const extractedDir = path.join(__dirname, "../data/extracted");
const structuredDir = path.join(__dirname, "../data/structured");

// Ensure structured folder exists
if (!fs.existsSync(structuredDir)) {
  fs.mkdirSync(structuredDir, { recursive: true });
}

const cleanedFiles = fs
  .readdirSync(extractedDir)
  .filter((f) => f.endsWith("_cleaned.txt"));

console.log("Cleaned files found:", cleanedFiles);

cleanedFiles.forEach((file) => {
  try {
    const raw = fs.readFileSync(path.join(extractedDir, file), "utf-8");

    let jsonData = {};
    const filenameUpper = file.toUpperCase();

    // ----------------------------
    // MLND
    // ----------------------------
    if (filenameUpper.includes("MLND")) {
      jsonData = {
        modelName: "mlnd",
        displayName: "Maize Lethal Necrosis Disease",
        crop: "Maize",
        description:
          "Maize Lethal Necrosis Disease (MLND) is a viral disease affecting maize, caused by co-infection of Maize chlorotic mottle virus and Sugarcane mosaic virus.",
        symptoms: [
          "Chlorotic mottling",
          "Leaf necrosis",
          "Stunted growth",
          "Poor grain formation",
        ],
        type: "viral",
        severity: "high",
        spreadRisk: "high",
        treatment: {
          chemical: [],
          organic: [],
          cultural: ["Remove infected plants", "Control insect vectors"],
        },
        prevention: ["Use certified seed", "Crop rotation", "Field sanitation"],
        yieldImpactPercentage: 30,
        recommendedFertilizers: [],
        recoveryTimeDays: 30,
        confidenceThreshold: 70,
        source: { name: "KALRO", url: "https://www.kalro.org", verified: true },
      };
    }
    // ----------------------------
    // AFLATOXIN
    // ----------------------------
    else if (filenameUpper.includes("AFLATOXIN")) {
      jsonData = {
        modelName: "aflatoxin_contamination",
        displayName: "Aflatoxin Contamination",
        crop: "Maize",
        description:
          "Aflatoxin is a fungal toxin contaminating stored grains like maize and groundnuts, caused by Aspergillus flavus and Aspergillus parasiticus.",
        symptoms: [
          "Mold growth on stored grains",
          "Discoloration of kernels",
          "Shriveled grains",
        ],
        type: "fungal",
        severity: "high",
        spreadRisk: "high",
        treatment: {
          chemical: [],
          organic: [],
          cultural: ["Sort and discard contaminated grains", "Use approved biocontrol agents"],
        },
        prevention: [
          "Dry grains to safe moisture level",
          "Use hermetic storage bags",
          "Timely harvesting",
        ],
        yieldImpactPercentage: 20,
        recommendedFertilizers: [],
        recoveryTimeDays: 30,
        confidenceThreshold: 70,
        source: { name: "FAO", url: "https://www.fao.org", verified: true },
      };
    }

    // ----------------------------
    // Save JSON
    // ----------------------------
    if (Object.keys(jsonData).length > 0) {
      const outputPath = path.join(
        structuredDir,
        file.replace("_cleaned.txt", ".json")
      );

      fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
      console.log(" Structured JSON created:", outputPath);
    } else {
      console.log(`⚠ No structured JSON mapping for file: ${file}`);
    }
  } catch (err) {
    console.error(` Failed processing ${file}:`, err.message);
  }
});