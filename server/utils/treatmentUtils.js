/**
 * Utilities for processing and cleaning agricultural treatments
 */

const GARBAGE_PHRASES = [
  "vegetable disease and symptoms",
  "cultural controls chemical",
  "best efforts at prevention",
  "common diseases (see mu extension",
  "by following disease prevention",
  "the following table describes some of the common diseases",
  "university of missouri extension",
  "missouri vegetable production guide",
  "table 1",
  "table 2",
  "page 1",
  "extension publication"
];

/**
 * Clean an array of treatment strings.
 * Filters out nulls, duplicates, and common scraper boilerplate.
 */
function cleanTreatmentArray(arr) {
  if (!Array.isArray(arr)) return [];

  const GARBAGE_PHRASES = [
    "university of", "extension", "research", "program", "college of",
    "department of", "table 1", "table 2", "refer to", "page", "bulletin",
    "publication", "guide", "handbook", "fact sheet"
  ];

  const cleaned = arr
    .map((t) => String(t).trim())
    .filter((t) => {
      // Filter by length and common garbage phrases
      if (t.length < 3 || t.length > 400) return false;
      const search = t.toLowerCase();
      return !GARBAGE_PHRASES.some((phrase) => search.includes(phrase));
    });

  // Intelligent deduplication (case-insensitive and base-name aware)
  const seen = new Set();
  return cleaned.filter((t) => {
    const base = t.toLowerCase().split(/[(\[0-9]/)[0].trim(); // Get base name before weights/details
    if (!base || seen.has(base)) return false;
    seen.add(base);
    return true;
  });
}

/**
 * Summarize a long list of treatments for prompt injection.
 * If the list is too long, it picks a representative set to avoid overwhelming the LLM.
 */
function summarizeTreatmentsForPrompt(treatments = [], limit = 5) {
  const cleaned = cleanTreatmentArray(treatments);
  if (cleaned.length <= limit) return cleaned.join("; ");

  // If we have too many, we pick the first few (usually most relevant if sorted)
  // and add a hint that there are more.
  return cleaned.slice(0, limit).join("; ") + ` (and ${cleaned.length - limit} more specialized options)`;
}

module.exports = {
  cleanTreatmentArray,
  summarizeTreatmentsForPrompt,
};
