function detectIntent(message = "") {
  const words = message
    .toLowerCase()
    .trim()
    .split(/\W+/); // split into clean words

  const hasWord = (keywordList) =>
    keywordList.some((keyword) => words.includes(keyword));

  // ---- DISEASE FIRST (PRIORITY) ----
  const diseaseKeywords = [
    "disease",
    "symptom",
    "infection",
    "fungus",
    "fungal",
    "mold",
    "mould",
    "rot",
    "rust",
    "blight",
    "spots",
    "yellow",
    "wilting",
    "powdery",
    "pest",
    "worms",
    "storage",
    "grains",
    "maize",
    "tomato",
    "leaf",
    "leaves",
  ];

  if (hasWord(diseaseKeywords)) {
    return "disease";
  }

  // ---- WEATHER ----
  const weatherKeywords = [
    "weather",
    "rain",
    "forecast",
    "temperature",
    "humidity",
    "climate",
    "storm",
    "drought",
  ];

  if (hasWord(weatherKeywords)) {
    return "weather";
  }

  // ---- BOOKING ----
  const bookingKeywords = [
    "book",
    "appointment",
    "schedule",
    "consult",
    "officer",
    "visit",
  ];

  if (hasWord(bookingKeywords)) {
    return "booking";
  }

  return "general";
}

module.exports = { detectIntent };