/**
 * AI Service (Mock)
 * In production, integrate with actual ML models or APIs
 */

const mockDiseases = [
  {
    name: 'Leaf Blight',
    confidence: 85,
    recommendations: 'Apply fungicide spray containing copper-based compounds. Remove affected leaves and ensure proper spacing for air circulation.'
  },
  {
    name: 'Powdery Mildew',
    confidence: 78,
    recommendations: 'Use sulfur-based fungicides. Improve air circulation and reduce humidity. Water plants at the base, not on leaves.'
  },
  {
    name: 'Rust Disease',
    confidence: 92,
    recommendations: 'Remove and destroy infected plant parts. Apply neem oil or fungicidal sprays. Ensure proper plant nutrition.'
  },
  {
    name: 'Bacterial Spot',
    confidence: 65,
    recommendations: 'Use copper-based bactericides. Practice crop rotation. Avoid overhead watering to prevent spread.'
  },
  {
    name: 'Healthy Plant',
    confidence: 88,
    recommendations: 'Plant appears healthy. Continue regular maintenance, proper watering, and monitoring for early signs of disease.'
  }
];

/**
 * Mock AI disease detection
 * @param {String} imagePath - Path to uploaded image
 * @returns {Object} Detection results
 */
const detectDisease = async (imagePath) => {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Randomly select a mock disease result
    const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
    
    // In production, replace with actual AI/ML model:
    // const result = await mlModel.predict(imagePath);
    // return {
    //   detectedDisease: result.disease,
    //   confidenceScore: result.confidence,
    //   recommendations: result.recommendations
    // };
    
    return {
      detectedDisease: randomDisease.name,
      confidenceScore: randomDisease.confidence,
      recommendations: randomDisease.recommendations
    };
  } catch (error) {
    console.error('AI Detection Error:', error);
    throw new Error('Failed to process image');
  }
};

module.exports = {
  detectDisease
};
