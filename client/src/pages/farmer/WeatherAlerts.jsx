import { useEffect, useState } from "react";
import FarmerLayout from "../../components/FarmerLayout.jsx";
import { getForecastRequest } from "../../services/api";
import { generateAlerts } from "../../utils/weatherAlert.js";


export default function WeatherAlerts() {
  const farmer = {
    location: "Nairobi", // 🔁 replace with auth/context later
  };

  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const { data } = await getForecastRequest(farmer.location);

        // OpenWeather gives 3-hour intervals → convert to daily
        const daily = data.list.filter((_, i) => i % 8 === 0);

        setForecast(daily);
        setAlerts(generateAlerts(daily));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (farmer?.location) fetchForecast();
  }, [farmer.location]);

  return (
    <FarmerLayout
      title="Weather & Alerts"
      subtitle={`Forecast for ${farmer.location}`}
    >
      {loading ? (
        <p className="text-sm text-slate-500">Loading weather…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Forecast */}
          <section className="lg:col-span-2 rounded-3xl border bg-white p-6">
            <h2 className="text-lg font-semibold">7-day forecast</h2>

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
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-500">No active alerts</p>
              ) : (
                alerts.map((alert, i) => (
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
