import { useEffect, useState, useMemo } from "react";
import FarmerLayout from "../../components/FarmerLayout.jsx";
import { getForecastRequest } from "../../services/api";
import { generateAlerts } from "../../utils/weatherAlert.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function WeatherAlerts() {
  const { user } = useAuth();

  const [locationData, setLocationData] = useState({
    name: user?.Location || "Detecting location...",
    lat: null,
    lon: null,
  });

  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const detectLocation = async () => {
      // Skip if user has a location set in their profile
      if (user?.Location) {
        try {
          const data = await getForecastRequest({ location: user.Location });
          // If we have data, we'll process it in the other useEffect
          // But we need to set loading to true and wait for the other useEffect to trigger if we use coords
          // Actually, let's just use city name if user.Location is present
          const daily = data.list.filter((_, i) => i % 8 === 0);
          setForecast(daily);
          setAlerts(generateAlerts(daily));
          setLoading(false);
          return;
        } catch (err) {
          console.error("Failed to fetch weather for profile location:", err);
          // Continue to IP detection ONLY if profile location failed
        }
      }

      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.city) {
          setLocationData({
            name: `${data.city}, ${data.country_name}`,
            lat: data.latitude,
            lon: data.longitude,
          });
        } else {
          throw new Error("Failed to detect location from IP");
        }
      } catch (err) {
        console.error("Location detection error:", err);
        // Fallback to a default location if detection fails
        setLocationData({
          name: "Nairobi, Kenya",
          lat: -1.286389,
          lon: 36.817223,
        });
      }
    };

    detectLocation();
  }, [user?.Location]);

  useEffect(() => {
    const fetchForecastByCoords = async () => {
      // Only fetch if we have coordinates and NO profile location (or profile location just failed)
      // If we already loaded forecast in the first useEffect, we might want to skip this
      // But for simplicity, let's just let it run if lat/lon are set
      if (!locationData.lat || !locationData.lon) return;

      try {
        setLoading(true);
        const data = await getForecastRequest({
          lat: locationData.lat,
          lon: locationData.lon,
        });

        // OpenWeather gives 3-hour intervals → convert to daily
        const daily = data.list.filter((_, i) => i % 8 === 0);

        setForecast(daily);
        setAlerts(generateAlerts(daily));
      } catch (err) {
        const message =
          err?.response?.data?.message || "Failed to fetch weather data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (locationData.lat && locationData.lon && !user?.Location) {
      fetchForecastByCoords();
    }
  }, [locationData.lat, locationData.lon, user?.Location]);

  // Deduplicate alerts for display
  const uniqueAlerts = useMemo(() => {
    const seen = new Set();
    return alerts.filter(alert => {
      const key = `${alert.title}|${alert.detail}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [alerts]);

  return (
    <FarmerLayout
      title="Weather & Alerts"
      subtitle={`Forecast for ${locationData.name}`}
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading weather…</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Forecast */}
          <section className="lg:col-span-2 rounded-3xl border bg-white p-6">
            <h2 className="text-lg font-semibold">5-day forecast</h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {forecast.map((item) => (
                <div key={item.dt} className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">
                    {new Date(item.dt * 1000).toLocaleDateString("en-KE", {
                      weekday: "short",
                    })}
                  </div>
                  <div className="text-base font-semibold">
                    {Math.round(item.main.temp)}°C
                  </div>
                  <div className="text-xs capitalize text-slate-600">
                    {item.weather[0].description}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Alerts */}
          <section className="rounded-3xl border bg-white p-6">
            <h2 className="text-lg font-semibold">Active alerts</h2>

            <div className="mt-4 space-y-3">
              {uniqueAlerts.length === 0 ? (
                <p className="text-sm text-slate-500">No active alerts</p>
              ) : (
                uniqueAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
                  >
                    <div className="text-sm font-semibold text-amber-900">
                      {alert.title}
                    </div>
                    <div className="mt-1 text-sm text-amber-800">
                      {alert.detail}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </FarmerLayout>
  );
}
