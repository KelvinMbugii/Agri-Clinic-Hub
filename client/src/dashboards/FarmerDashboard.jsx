import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FarmerLayout from "../components/FarmerLayout.jsx";
import { 
  CloudSun, Droplets, ThermometerSun, Leaf, Bot, 
  CalendarDays, ScanLine, ArrowRight, CheckCircle2 
} from "lucide-react";
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
      icon: ScanLine,
      color: "text-agri-600",
      bg: "bg-agri-50"
    },
    {
      title: "Ask AI",
      description: "Get tailored advice in simple language.",
      to: "/farmer/ai-assistant",
      icon: Bot,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Book Consultation",
      description: "Talk to an officer for deeper guidance.",
      to: "/farmer/consultations",
      icon: CalendarDays,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Weather Alerts",
      description: "View location-based alerts and planning forecast.",
      to: "/farmer/weather",
      icon: CloudSun,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ];

  return (
    <FarmerLayout
      title="Home Dashboard"
      subtitle="Your calm overview with today’s essentials"
    >
      {/* Hero Welcome */}
      <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-agri-700 to-agri-500 relative shadow-md">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative px-8 py-10 md:py-12 text-white">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Welcome to your Agri-Clinic Hub</h1>
          <p className="text-agri-50 text-sm md:text-base max-w-xl leading-relaxed font-medium opacity-90">
            Monitor your crops, check local weather, and get AI-powered insights tailored for your farm.
          </p>
        </div>
      </div>

      {/* Weather Section */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Weather Analytics</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Current conditions and 7-day forecast for {farmerLocation}.</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-sm">
              <CloudSun className="h-7 w-7" />
            </div>
          </div>

          {loading.weather ? (
            <p className="text-sm font-medium text-slate-500 mt-8 mb-6 animate-pulse">Loading localized weather data…</p>
          ) : error.weather ? (
            <p className="text-sm font-medium text-red-600 mt-8 mb-6">{error.weather}</p>
          ) : weather ? (
            <div className="mt-8 mb-4 flex items-center gap-8">
              <div className="text-6xl font-extrabold tracking-tighter text-slate-900">
                {Math.round(weather.main.temp)}°C
              </div>
              <div className="flex flex-col gap-2 border-l-2 border-slate-100 pl-8">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 capitalize">
                  <ThermometerSun className="h-4.5 w-4.5 text-amber-500" />
                  {weather.weather?.[0]?.description}
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                  <Droplets className="h-4.5 w-4.5 text-blue-500" />
                  Humidity: {weather.main.humidity}%
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {forecast.map((day) => (
              <div key={day.dt} className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-slate-100 hover:scale-[1.02]">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {new Date(day.dt * 1000).toLocaleDateString("en-KE", {
                    weekday: "short",
                  })}
                </div>
                <div className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                  {Math.round(day.main.temp)}°C
                </div>
                <div className="text-xs font-semibold text-slate-500 capitalize text-center leading-tight">
                  {day.weather?.[0]?.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-agri-50 text-agri-600 shadow-sm">
              <Leaf className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Preventive Tips</h2>
          </div>

          <ul className="flex-1 space-y-4 text-sm text-slate-600 font-medium">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-agri-500 mt-0.5" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>

          <Link
            to="/farmer/weather"
            className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-agri-50 py-3.5 text-sm font-bold text-agri-700 transition hover:bg-agri-100/80 hover:scale-[1.01]"
          >
            View weather alerts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-5 tracking-tight">Quick Actions</h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-agri-200 hover:shadow-premium"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${action.bg} ${action.color} shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <action.icon className="h-7 w-7" />
              </div>
              <div className="text-lg font-bold text-slate-800 tracking-tight">{action.title}</div>
              <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Featured Articles</h2>
          <Link to="/farmer/articles" className="group flex items-center gap-1.5 text-sm font-bold text-agri-600 hover:text-agri-700 transition-colors">
            View all 
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredArticles.map((article) => (
            <div key={article._id} className="group cursor-pointer rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all duration-300 hover:bg-white hover:shadow-lg hover:-translate-y-1 hover:border-slate-200">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-agri-700 transition-colors line-clamp-2 tracking-tight leading-snug">{article.title}</h3>
              <p className="mt-3 text-sm font-medium text-slate-500 line-clamp-3 leading-relaxed">{article.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </FarmerLayout>
  );
}
