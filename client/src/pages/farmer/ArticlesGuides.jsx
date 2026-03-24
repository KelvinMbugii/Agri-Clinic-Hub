import { useEffect, useState } from 'react';
import FarmerLayout from '../../components/FarmerLayout.jsx';
import { getArticlesRequest } from '../../services/api.js';

export default function ArticlesGuides() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);

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

  const topics = ['All', 'Seasonal planning', 'Pest prevention', 'Soil health', 'Market tips', 'General'];

  const filteredArticles = selectedTopic === 'All' 
    ? articles 
    : articles.filter(a => a.topic === selectedTopic);

  return (
    <FarmerLayout title="Articles & Guides" subtitle="Easy-to-follow learning resources">
      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Topics</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {topics.map(topic => (
              <li 
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`cursor-pointer rounded-xl px-3 py-2 transition-colors ${
                  selectedTopic === topic ? 'bg-agri-50 text-agri-800 font-medium' : 'hover:bg-slate-50'
                }`}
              >
                {topic}
              </li>
            ))}
          </ul>
        </aside>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedTopic === 'All' ? 'Featured guides' : `${selectedTopic} guides`}
            </h2>
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
            ) : filteredArticles.length === 0 ? (
              <div className="text-sm text-slate-500">No articles found in this topic.</div>
            ) : (
              filteredArticles.map((article) => (
                <article
                  key={article._id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  {article.image && (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${article.image}`}
                      alt={article.title}
                      className="mb-3 h-40 w-full rounded-xl object-cover"
                    />
                  )}
                  <div className="text-sm font-semibold text-slate-900">{article.title}</div>
                  <div className="mt-2 line-clamp-3 text-sm text-slate-700">
                    {article.content}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                       <span>By {article.author?.name || 'Officer'}</span>
                       <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px]">{article.topic || 'General'}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedArticle(article)}
                      className="text-agri-700 font-semibold hover:text-agri-800" 
                      type="button"
                    >
                      Read more
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button 
              onClick={() => setSelectedArticle(null)}
              className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="p-8">
              {selectedArticle.image && (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${selectedArticle.image}`}
                  alt={selectedArticle.title}
                  className="mb-6 h-64 w-full rounded-2xl object-cover shadow-lg"
                />
              )}
              <div className="flex items-center gap-3">
                 <span className="rounded-full bg-agri-50 px-3 py-1 text-xs font-semibold text-agri-700">
                    {selectedArticle.topic || 'General'}
                 </span>
                 <span className="text-sm text-slate-500">
                    {selectedArticle.createdAt ? new Date(selectedArticle.createdAt).toLocaleDateString() : ''}
                 </span>
              </div>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">{selectedArticle.title}</h2>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600 font-medium">
                 <div className="h-8 w-8 rounded-full bg-agri-100 flex items-center justify-center text-agri-700 mr-1">
                    {selectedArticle.author?.name?.[0] || 'O'}
                 </div>
                 By {selectedArticle.author?.name || 'Officer'}
              </div>
              <div className="mt-8 whitespace-pre-wrap text-lg leading-relaxed text-slate-700">
                {selectedArticle.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </FarmerLayout>
  );
}
