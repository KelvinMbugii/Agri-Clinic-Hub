const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    displayName: {
      type: String,
      required: true,
    },

    crop: {
      type: String,
      required: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
    },

    symptoms: {
      type: [String],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "fungal",
        "bacterial",
        "viral",
        "nutrient_deficiency",
        "pest",
        "healthy",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    spreadRisk: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    treatment: {
      chemical: [String],
      organic: [String],
      cultural: [String], // pruning, spacing, irrigation adjustments
    },

    treatmentDuration: {
      type: String,
    },

    treatmentFrequency: {
      type: String,
    },

    prevention: {
      type: [String],
      required: true,
    },

    yieldImpactPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },

    recommendedFertilizers: [String],

    recoveryTimeDays: Number,

    confidenceThreshold: {
      type: Number,
      default: 60,
    },
    source: {
      name: String, // FAO, KALRO
      url: String,
      verified: Boolean,
    },
  },  

  { timestamps: true },
);


(diseaseSchema.index({
  displayName: "text",
  modelName: "text",
  crop: "text",
  type: "text",
  symptoms: "text",
  description: "text",
  "treatment.cultural": "text",
  "treatment.chemical": "text",
  "treatment.organic": "text",
  prevention: "text",
}),

  (module.exports = mongoose.model("Disease", diseaseSchema)));
