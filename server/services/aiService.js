// /**
//  * AI Service (Mock)
//  * In production, integrate with actual ML models or APIs
//  */

// const mockDiseases = [
//   {
//     name: 'Leaf Blight',
//     confidence: 85,
//     recommendations: 'Apply fungicide spray containing copper-based compounds. Remove affected leaves and ensure proper spacing for air circulation.'
//   },
//   {
//     name: 'Powdery Mildew',
//     confidence: 78,
//     recommendations: 'Use sulfur-based fungicides. Improve air circulation and reduce humidity. Water plants at the base, not on leaves.'
//   },
//   {
//     name: 'Rust Disease',
//     confidence: 92,
//     recommendations: 'Remove and destroy infected plant parts. Apply neem oil or fungicidal sprays. Ensure proper plant nutrition.'
//   },
//   {
//     name: 'Bacterial Spot',
//     confidence: 65,
//     recommendations: 'Use copper-based bactericides. Practice crop rotation. Avoid overhead watering to prevent spread.'
//   },
//   {
//     name: 'Healthy Plant',
//     confidence: 88,
//     recommendations: 'Plant appears healthy. Continue regular maintenance, proper watering, and monitoring for early signs of disease.'
//   }
// ];

// /**
//  * Mock AI disease detection
//  * @param {String} imagePath - Path to uploaded image
//  * @returns {Object} Detection results
//  */
// const detectDisease = async (imagePath) => {
//   try {
//     // Simulate AI processing delay
//     await new Promise(resolve => setTimeout(resolve, 500));
    
//     // Randomly select a mock disease result
//     const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    
//     // In production, replace with actual AI/ML model:
//     // const result = await mlModel.predict(imagePath);
//     // return {
//     //   detectedDisease: result.disease,
//     //   confidenceScore: result.confidence,
//     //   recommendations: result.recommendations
//     // };
    
//     return {
//       detectedDisease: randomDisease.name,
//       confidenceScore: randomDisease.confidence,
//       recommendations: randomDisease.recommendations
//     };
//   } catch (error) {
//     console.error('AI Detection Error:', error);
//     throw new Error('Failed to process image');
//   }
// };

// module.exports = {
//   detectDisease
// };



/**
 * AI Service (Mock)
 * Works in Node 20 with Express 5
 * Simulates plant disease detection
 */

const tf = require("@tensorflow/tfjs");
const path = require("path");
const sharp = require("sharp"); // for image preprocessing

let model = null;

/**
 * Load plant disease model
 */
const loadPlantDiseaseModel = async () => {
  const modelPath = path.join(
    __dirname,
    "../aiService/plant_disease_model/model.json",
  );
  console.log("Loading model from:", modelPath);
  model = await tf.loadLayersModel("file://" + modelPath);
  console.log("Model loaded successfully!");
};

/**
 * Preprocess image buffer into a tensor suitable for model input
 * @param {Buffer} imageBuffer
 */
const preprocessImage = async (imageBuffer) => {
  // Resize to 224x224 and convert to RGB
  const resizedBuffer = await sharp(imageBuffer)
    .resize(224, 224)
    .toFormat("png")
    .toBuffer();

  // Decode image to tensor
  let tensor = tf.node.decodeImage(resizedBuffer, 3); // 3 channels RGB
  tensor = tensor.expandDims(0); // add batch dimension
  tensor = tensor.div(255); // normalize to [0,1]
  return tensor;
};

/**
 * Detect disease from image buffer
 * @param {Buffer} imageBuffer
 */
const detectDisease = async (imageBuffer) => {
  if (!model) {
    throw new Error("Model not loaded. Call loadPlantDiseaseModel first.");
  }

  const imageTensor = await preprocessImage(imageBuffer);

  // Run prediction
  const predictions = model.predict(imageTensor);

  // Assuming model outputs probabilities per class
  const predictionArray = predictions.arraySync()[0];

  // Map your class indices to disease names
  const classNames = [
    "Leaf Blight",
    "Powdery Mildew",
    "Rust Disease",
    "Bacterial Spot",
    "Healthy Plant",
  ];

  // Find the class with highest probability
  const maxIndex = predictionArray.indexOf(Math.max(...predictionArray));
  const detectedDisease = classNames[maxIndex];
  const confidenceScore = Math.round(predictionArray[maxIndex] * 100);

  // Add recommendations per disease
  const recommendationsMap = {
    "Leaf Blight":
      "Apply fungicide spray containing copper-based compounds. Remove affected leaves and ensure proper spacing.",
    "Powdery Mildew":
      "Use sulfur-based fungicides. Improve air circulation and reduce humidity. Water at the base, not on leaves.",
    "Rust Disease":
      "Remove and destroy infected parts. Apply neem oil or fungicides. Ensure proper nutrition.",
    "Bacterial Spot":
      "Use copper-based bactericides. Practice crop rotation. Avoid overhead watering.",
    "Healthy Plant":
      "Plant appears healthy. Continue regular maintenance and monitoring.",
  };

  return {
    detectedDisease,
    confidenceScore,
    recommendations: recommendationsMap[detectedDisease],
  };
};

module.exports = {
  loadPlantDiseaseModel,
  detectDisease,
};
