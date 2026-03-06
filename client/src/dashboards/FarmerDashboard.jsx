import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FarmerLayout from "../components/FarmerLayout.jsx";
import {
  getArticlesRequest,
  getForecastRequest,
  getWeatherRequest,
} from "../services/api.js";

export default function FarmerDashboard() {
  const farmerLocation = "Nairobi";

  const [articles, setArticles] = useState([]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  const [loading, setLoading] = useState({
    articles: true,
    weather: true,
  });

  const [error, setError] = useState({
    articles: "",
    weather: "",
  });

  useEffect(() => {
    let cancelled = false;

    const fetchArticles = async () => {
      setLoading((s) => ({ ...s, articles: true }));
      setError((s) => ({ ...s, articles: "" }));

      try {
        const data = await getArticlesRequest();
        if (!cancelled) setArticles(data?.articles || []);
      } catch (err) {
        if (!cancelled) {
          setError((s) => ({
            ...s,
            articles: err?.response?.data?.message || "Failed to load articles",
          }));
        }
      } finally {
        if (!cancelled) setLoading((s) => ({ ...s, articles: false }));
      }
    };

    fetchArticles();
    return () => (cancelled = true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      setLoading((s) => ({ ...s, weather: true }));
      setError((s) => ({ ...s, weather: "" }));

      try {
        const [currentWeather, forecastData] = await Promise.all([
          getWeatherRequest(farmerLocation),
          getForecastRequest(farmerLocation),
        ]);

        if (!cancelled) {
          const dailyForecast = (forecastData?.list || []).filter(
            (_, i) => i % 8 === 0,
          );

          setWeather(currentWeather);
          setForecast(dailyForecast);
        }
      } catch (err) {
        if (!cancelled) {
          setError((s) => ({
            ...s,
            weather:
              err?.response?.data?.message ||
              err?.message ||
              "Failed to load weather",
          }));
        }
      } finally {
        if (!cancelled) setLoading((s) => ({ ...s, weather: false }));
      }
    };

    fetchWeather();
    return () => (cancelled = true);
  }, [farmerLocation]);

  const featuredArticles = useMemo(() => articles.slice(0, 3), [articles]);

  const tips = [
    "Water early morning to reduce evaporation.",
    "Check leaves for moisture after rain to prevent fungus.",
    "Mulch around crops to keep soil cool.",
  ];

  const quickActions = [
    {
      title: "Scan Crop Disease",
      description: "Upload a leaf photo for quick AI analysis.",
      to: "/farmer/disease-detection",
    },
    {
      title: "Ask AI",
      description: "Get tailored advice in simple language.",
      to: "/farmer/ai-assistant",
    },
    {
      title: "Book Consultation",
      description: "Talk to an officer for deeper guidance.",
      to: "/farmer/consultations",
    },
    {
      title: "Weather Alerts",
      description: "View location-based alerts and planning forecast.",
      to: "/farmer/weather",
    },
  ];

  return (
    <FarmerLayout
      title="Home Dashboard"
      subtitle="Your calm overview with today’s essentials"
    >
      {/* Weather Section */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border bg-white p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Weather analytics
          </h2>
          <p className="text-sm text-slate-600">
            Current conditions and the next 7 days for {farmerLocation}.
          </p>

          {loading.weather ? (
            <p className="text-sm text-slate-500 mt-4">Loading weather…</p>
          ) : error.weather ? (
            <p className="text-sm text-red-600 mt-4">{error.weather}</p>
          ) : weather ? (
            <div className="mt-4 text-sm">
              {Math.round(weather.main.temp)}°C • {weather.weather?.[0]?.main}
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {forecast.map((day) => (
              <div key={day.dt} className="rounded-2xl border bg-slate-50 p-3">
                <div className="text-xs text-slate-500">
                  {new Date(day.dt * 1000).toLocaleDateString("en-KE", {
                    weekday: "short",
                  })}
                </div>
                <div className="text-base font-semibold">
                  {Math.round(day.main.temp)}°C
                </div>
                <div className="text-xs text-slate-600 capitalize">
                  {day.weather?.[0]?.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-3xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Preventive tips
          </h2>

          <ul className="mt-4 space-y-3 text-sm">
            {tips.map((tip) => (
              <li key={tip}>• {tip}</li>
            ))}
          </ul>

          <Link
            to="/farmer/weather"
            className="mt-5 inline-block text-sm font-medium text-green-700"
          >
            View weather alerts →
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="rounded-2xl border bg-white p-4 hover:shadow-md"
            >
              <div className="text-sm font-semibold">{action.title}</div>
              <p className="text-sm text-slate-600 mt-1">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section className="mt-6 rounded-3xl border bg-white p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Featured articles</h2>
          <Link to="/farmer/articles" className="text-sm text-green-700">
            View all
          </Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredArticles.map((article) => (
            <div key={article._id} className="border rounded-xl p-4">
              <h3 className="font-semibold">{article.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{article.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </FarmerLayout>
  );
}
