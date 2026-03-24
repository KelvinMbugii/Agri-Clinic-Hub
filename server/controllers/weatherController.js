const axios = require("axios");

// @desc    Get current weather for a location
// @route   GET /api/weather
// @access  Public
exports.getWeather = async (req, res) => {
  const { location, lat, lon } = req.query;

  if (!location && (!lat || !lon)) {
    return res.status(400).json({ message: "Location or coordinates are required" });
  }

  try {
    const params = {
      units: "metric",
      appid: process.env.OPENWEATHER_API_KEY,
    };

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else {
      params.q = location;
    }

    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      { params }
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
  const { location, lat, lon } = req.query;

  if (!location && (!lat || !lon)) {
    return res.status(400).json({ message: 'Location or coordinates are required' });
  }

  try {
    const params = {
      units: 'metric',
      appid: process.env.OPENWEATHER_API_KEY
    };

    if (lat && lon) {
      params.lat = lat;
      params.lon = lon;
    } else {
      params.q = location;
    }

    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/forecast',
      { params }
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
