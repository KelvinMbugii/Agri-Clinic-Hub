const { aiEnhancementSchema } = require("../validators/aiSchema");

function safeParseAI(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    const validated = aiEnhancementSchema.parse(parsed);
    return validated;
  } catch (err) {
    return null;
  }
}

module.exports = { safeParseAI };
