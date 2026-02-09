const axios = require("axios");

// @desc    Get current weather for a location
// @route   GET /api/weather
// @access  Public
exports.getWeather = async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ message: "Location is required" });
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: location,
          units: "metric",
          appid: process.env.OPENWEATHER_API_KEY,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Get Weather Error:", error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(500).json({ message: "Failed to fetch weather data" });
  }
};


// @desc    Get 5-day weather forecast for a location
// @route   GET /api/weather/forecast
// @access  Public
exports.getForecast = async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.status(400).json({ message: 'Location is required' });
  }

  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/forecast',
      {
        params: {
          q: location,
          units: 'metric',
          appid: process.env.OPENWEATHER_API_KEY
        }
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Get Forecast Error:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Location not found' });
    }

    res.status(500).json({ message: 'Failed to fetch forecast data' });
  }
};
