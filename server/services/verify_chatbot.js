require("dotenv").config({ path: "../.env" });
const { chatWithKnowledge } = require("./aiService");

async function verifyChatbot() {
  console.log("--- TEST 1: Greeting & Small Talk ---");
  const greeting = await chatWithKnowledge("Hello! How are you today?");
  console.log("Chatbot Response:", greeting);
  console.log("\n");

  console.log("--- TEST 2: High Confidence Scan Context ---");
  const highConfScan = {
    detectedDisease: "Tomato_Septoria_leaf_spot",
    confidenceScore: 98,
    is_uncertain: false
  };
  const response1 = await chatWithKnowledge("I scanned my tomato, what are the steps?", { lastDetection: highConfScan });
  console.log("Chatbot Response:", response1);
  console.log("\n");

  console.log("--- TEST 3: Uncertain (Top-K) Scan Context ---");
  const uncertainScan = {
    detectedDisease: "Tomato_Septoria_leaf_spot",
    confidenceScore: 55,
    is_uncertain: true,
    alternative_diagnoses: [
      { label: "Tomato_Septoria_leaf_spot", confidence: 0.55 },
      { label: "Tomato_healthy", confidence: 0.40 }
    ]
  };
  const response2 = await chatWithKnowledge("How should I treat this crop?", { lastDetection: uncertainScan });
  console.log("Chatbot Response:", response2);
}

if (require.main === module) {
  verifyChatbot().catch(console.error);
}
