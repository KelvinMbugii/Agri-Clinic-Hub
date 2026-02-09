const express = require('express');
const router = express.Router();
const { getWeather, getForecast } = require('../controllers/weatherController');

// @route   GET /api/weather
// @desc    Get weather data for a location
// @access  Public
router.get('/', getWeather);
router.get('/forecast', getForecast);

module.exports = router;