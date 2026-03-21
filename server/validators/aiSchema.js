const { z } = require("zod");

const aiEnhancementSchema = z.object({
  extra_advice: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  best_practices: z.array(z.string()).default([]),
});

module.exports = {
  aiEnhancementSchema,
};
