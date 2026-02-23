// const OpenAI = require("openai");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const generateResponse = async ({ message, diseaseInfo }) => {
//   try {
//     const systemPrompt = `
// You are an agricultural expert assistant helping farmers.
// Give clear, practical, and safe farming advice.
// Keep responses simple and easy to understand.
// `;

//     const contextData = diseaseInfo
//       ? `
// Detected Disease Information:
// Name: ${diseaseInfo.name}
// Description: ${diseaseInfo.description}
// Organic Treatment: ${diseaseInfo.organicTreatment?.join(", ")}
// Chemical Treatment: ${diseaseInfo.chemicalTreatment?.join(", ")}
// Prevention: ${diseaseInfo.prevention?.join(", ")}
// Severity: ${diseaseInfo.severity}
// `
//       : "";

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: systemPrompt },
//         {
//           role: "user",
//           content: contextData + "\nFarmer question: " + message,
//         },
//       ],
//       temperature: 0.5,
//     });

//     return completion.choices[0].message.content;
//   } catch (error) {
//     console.error("LLM Error:", error);
//     return "Sorry, I couldn't process your request at the moment.";
//   }
// };

// module.exports = { generateResponse };
