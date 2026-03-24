const mongoose = require("mongoose");

const knowledgeFragmentSchema = new mongoose.Schema(
  {
    sourceDocument: {
      type: String,
      required: true,
      index: true,
    },
    textChunk: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["document", "image"],
      required: true,
    },
  },
  { timestamps: true }
);

(knowledgeFragmentSchema.index({
  sourceDocument: "text",
  textChunk: "text",
}),

  (module.exports = mongoose.model("KnowledgeFragment", knowledgeFragmentSchema)));
