import { useEffect, useState } from 'react';
import { getWeatherRequest } from '../services/api';

export default function WeatherCard({ location }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!location) return;

        const fetchWeather = async () => {
            try {
                const data = await getWeatherRequest(location);
                setWeather(data);
            } catch (err) {
                setError(err?.response?.data?.message || 'Failed to fetch weather');
            } finally {
                setLoading(false);
            }
        };
        fetchWeather();
    }, [location]);

    if (!location) return <p> No Location Set</p>
    if (loading) return <div>Loading weather...</div>;
    if (!weather) return <div>No weather data available</div>;
    if (error) return <div>Error: {error}</div>;

    return (
      <div className="rounded-2xl border bg-white p-4 shadow-soft">
        <h3 className="text-lg font-semibold">Current Weather</h3>
        <p className="text-sm text-slate-600">{weather.name}</p>

        <div className="mt-3 space-y-1 text-sm">
          <p>🌡 Temperature: {weather.main.temp}°C</p>
          <p>💧 Humidity: {weather.main.humidity}%</p>
          <p>🌬 Wind: {weather.wind.speed} m/s</p>
          <p>☁ Condition: {weather.weather[0].description}</p>
        </div>
      </div>
    );
}