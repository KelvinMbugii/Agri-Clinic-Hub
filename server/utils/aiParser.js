const { aiEnhancementSchema } = require("../validators/aiSchema");

function stripMarkdownJSON(text) {
  let cleanStr = text.trim();
  if (cleanStr.startsWith('```json')) cleanStr = cleanStr.slice(7);
  else if (cleanStr.startsWith('```')) cleanStr = cleanStr.slice(3);
  if (cleanStr.endsWith('```')) cleanStr = cleanStr.slice(0, -3);
  return cleanStr.trim();
}

function safeParseAI(jsonString) {
  try {
    const parsed = JSON.parse(stripMarkdownJSON(jsonString));
    const validated = aiEnhancementSchema.parse(parsed);
    return validated;
  } catch (err) {
    return null;
  }
}

function parseGenericJson(jsonString) {
  try {
    return JSON.parse(stripMarkdownJSON(jsonString));
  } catch (err) {
    return null;
  }
}

module.exports = { safeParseAI, parseGenericJson };
