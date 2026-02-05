import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FarmerLayout from '../components/FarmerLayout.jsx';
import { getArticlesRequest } from '../services/api.js';

export default function FarmerDashboard() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState({ articles: true });
  const [error, setError] = useState({ articles: '' });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading((s) => ({ ...s, articles: true }));
      setError((s) => ({ ...s, articles: '' }));
      try {
        const data = await getArticlesRequest();
        if (!cancelled) setArticles(data?.articles || []);
      } catch (err) {
        if (!cancelled) {
          setError((s) => ({
            ...s,
            articles: err?.response?.data?.message || 'Failed to load articles'
          }));
        }
      } finally {
        if (!cancelled) setLoading((s) => ({ ...s, articles: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredArticles = useMemo(() => articles.slice(0, 3), [articles]);
  const forecast = [
    { day: 'Mon', temp: '25°C', condition: 'Sunny' },
    { day: 'Tue', temp: '23°C', condition: 'Cloudy' },
    { day: 'Wed', temp: '22°C', condition: 'Light rain' },
    { day: 'Thu', temp: '26°C', condition: 'Sunny' },
    { day: 'Fri', temp: '24°C', condition: 'Windy' },
    { day: 'Sat', temp: '21°C', condition: 'Showers' },
    { day: 'Sun', temp: '27°C', condition: 'Sunny' }
  ];
  const tips = [
    'Water early morning to reduce evaporation.',
    'Check leaves for moisture after rain to prevent fungus.',
    'Mulch around crops to keep soil cool.'
  ];

  return (
    <FarmerLayout
      title="Home Dashboard"
      subtitle="Your calm overview with today’s essentials"
    >
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Weather analytics</h2>
              <p className="text-sm text-slate-600">
                Current conditions and the next 7 days for your farm.
              </p>
            </div>
            <div className="rounded-2xl bg-agri-50 px-4 py-3">
              <div className="text-xs text-agri-800">Now</div>
              <div className="text-lg font-semibold text-slate-900">24°C • Humid</div>
              <div className="text-xs text-slate-600">Light breeze, 10% rain</div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {forecast.map((day) => (
              <div
                key={day.day}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="text-xs text-slate-500">{day.day}</div>
                <div className="text-base font-semibold text-slate-900">{day.temp}</div>
                <div className="text-xs text-slate-600">{day.condition}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Preventive tips</h2>
          <p className="text-sm text-slate-600">Based on this week’s weather.</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-agri-600" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/farmer/weather"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-agri-700"
          >
            View weather alerts →
          </Link>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: 'Scan Crop Disease',
              description: 'Upload a leaf photo for quick AI analysis.',
              to: '/farmer/disease-detection'
            },
            {
              title: 'Ask AI',
              description: 'Get tailored advice in simple language.',
              to: '/farmer/ai-assistant'
            },
            {
              title: 'Book Consultation',
              description: 'Talk to an officer for deeper guidance.',
              to: '/farmer/consultations'
            }
          ].map((action) => (
            <Link
              key={action.title}
              to={action.to}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="text-sm font-semibold text-slate-900">{action.title}</div>
              <p className="mt-2 text-sm text-slate-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Featured articles</h2>
            <p className="text-sm text-slate-600">Simple guides from agricultural officers.</p>
          </div>
          <Link
            to="/farmer/articles"
            className="text-sm font-medium text-agri-700 hover:text-agri-800"
          >
            View all
          </Link>
        </div>

        {error.articles ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error.articles}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {loading.articles ? (
            <div className="text-sm text-slate-500">Loading articles…</div>
          ) : featuredArticles.length === 0 ? (
            <div className="text-sm text-slate-500">No articles published yet.</div>
          ) : (
            featuredArticles.map((article) => (
              <article
                key={article._id}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{article.title}</div>
                  <div className="mt-2 line-clamp-3 text-sm text-slate-700">
                    {article.content}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>By {article.author?.name || 'Officer'}</span>
                  <span>
                    {article.createdAt ? new Date(article.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-xs font-semibold text-agri-700 shadow-sm hover:bg-agri-50"
                >
                  Read more
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </FarmerLayout>
  );
}
