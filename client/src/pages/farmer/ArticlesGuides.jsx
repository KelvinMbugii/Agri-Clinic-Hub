import { useEffect, useState } from 'react';
import FarmerLayout from '../../components/FarmerLayout.jsx';
import { getArticlesRequest } from '../../services/api.js';

export default function ArticlesGuides() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getArticlesRequest();
        if (!cancelled) setArticles(data?.articles || []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load articles');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <FarmerLayout title="Articles & Guides" subtitle="Easy-to-follow learning resources">
      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Topics</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li className="rounded-xl bg-agri-50 px-3 py-2 text-agri-800">Seasonal planning</li>
            <li className="rounded-xl px-3 py-2 hover:bg-slate-50">Pest prevention</li>
            <li className="rounded-xl px-3 py-2 hover:bg-slate-50">Soil health</li>
            <li className="rounded-xl px-3 py-2 hover:bg-slate-50">Market tips</li>
          </ul>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Featured guides</h2>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              Save for later
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="text-sm text-slate-500">Loading articles…</div>
            ) : articles.length === 0 ? (
              <div className="text-sm text-slate-500">No articles published yet.</div>
            ) : (
              articles.slice(0, 6).map((article) => (
                <article
                  key={article._id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="text-sm font-semibold text-slate-900">{article.title}</div>
                  <div className="mt-2 line-clamp-2 text-sm text-slate-700">
                    {article.content}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>By {article.author?.name || 'Officer'}</span>
                    <button className="text-agri-700 hover:text-agri-800" type="button">
                      Read more
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </FarmerLayout>
  );
}
