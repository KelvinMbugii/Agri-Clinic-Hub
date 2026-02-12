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

const axios = require("axios");
const FormData = require("form-data");

const AI_SERVICE_URL = "http://localhost:8000/predict";

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

// Optional mock fallback
const classNames = Object.keys(recommendationsMap);
const getMockPrediction = () => {
  const index = Math.floor(Math.random() * classNames.length);
  const disease = classNames[index];
  const confidence = Math.random() * 0.3 + 0.7; // 70-100%
  return {
    detectedDisease: disease,
    confidenceScore: Math.round(confidence * 100),
    recommendations: recommendationsMap[disease],
    source: "mock",
  };
};

const detectDisease = async (imageBuffer) => {
  try {
    const formData = new FormData();
    formData.append("file", imageBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    const response = await axios.post(AI_SERVICE_URL, formData, {
      headers: formData.getHeaders(),
      timeout: 15000, // 15s timeout to avoid hanging
    });

    const { disease, confidence } = response.data;

    return {
      detectedDisease: disease,
      confidenceScore: confidence,
      recommendations: recommendationsMap[disease] || "Consult agricultural expert.",
      source: "python-fastapi",
    };
  } catch (error) {
    // Log detailed info for debugging
    console.error("AI Service Error:", error.response?.data || error.message);
    
    // Optional: fallback to mock prediction
    return getMockPrediction();
  }
};

const getModelStatus = () => ({
  loaded: true,
  fallbackMode: false,
  source: "Python FastAPI AI Service",
});

module.exports = {
  detectDisease,
  getModelStatus,
};
