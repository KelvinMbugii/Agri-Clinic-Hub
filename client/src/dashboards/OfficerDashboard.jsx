import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import {
  createArticleRequest,
  deleteArticleRequest,
  getArticlesRequest,
  getAssignedBookingsRequest,
  updateArticleRequest,
  updateBookingStatusRequest
} from '../services/api.js';

export default function OfficerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState({ bookings: true, articles: true, saving: false });
  const [error, setError] = useState({ bookings: '', articles: '', saving: '' });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);

  const refreshBookings = async () => {
    setLoading((s) => ({ ...s, bookings: true }));
    setError((s) => ({ ...s, bookings: '' }));
    try {
      const data = await getAssignedBookingsRequest();
      setBookings(data?.bookings || []);
    } catch (err) {
      setError((s) => ({
        ...s,
        bookings: err?.response?.data?.message || 'Failed to load assigned bookings'
      }));
    } finally {
      setLoading((s) => ({ ...s, bookings: false }));
    }
  };

  const refreshArticles = async () => {
    setLoading((s) => ({ ...s, articles: true }));
    setError((s) => ({ ...s, articles: '' }));
    try {
      const data = await getArticlesRequest();
      setArticles(data?.articles || []);
    } catch (err) {
      setError((s) => ({
        ...s,
        articles: err?.response?.data?.message || 'Failed to load articles'
      }));
    } finally {
      setLoading((s) => ({ ...s, articles: false }));
    }
  };

  useEffect(() => {
    refreshBookings();
    refreshArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bookingItems = useMemo(() => bookings || [], [bookings]);

  const setStatus = async (bookingId, status) => {
    setError((s) => ({ ...s, bookings: '' }));
    try {
      await updateBookingStatusRequest(bookingId, status);
      await refreshBookings();
    } catch (err) {
      setError((s) => ({
        ...s,
        bookings: err?.response?.data?.message || 'Failed to update booking status'
      }));
    }
  };

  const startEdit = (article) => {
    setEditingId(article._id);
    setTitle(article.title || '');
    setContent(article.content || '');
    setError((s) => ({ ...s, saving: '' }));
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const saveArticle = async (e) => {
    e.preventDefault();
    setLoading((s) => ({ ...s, saving: true }));
    setError((s) => ({ ...s, saving: '' }));
    try {
      if (editingId) {
        await updateArticleRequest(editingId, { title, content });
      } else {
        await createArticleRequest({ title, content });
      }
      resetForm();
      await refreshArticles();
    } catch (err) {
      setError((s) => ({
        ...s,
        saving: err?.response?.data?.message || 'Failed to save article'
      }));
    } finally {
      setLoading((s) => ({ ...s, saving: false }));
    }
  };

  const removeArticle = async (id) => {
    setError((s) => ({ ...s, saving: '' }));
    try {
      await deleteArticleRequest(id);
      await refreshArticles();
    } catch (err) {
      setError((s) => ({
        ...s,
        saving: err?.response?.data?.message || 'Failed to delete article'
      }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-slate-900">Officer Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage bookings, conduct consultations (UI placeholder), and publish articles.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Booking Management</h2>
              <p className="mt-1 text-sm text-slate-600">Your assigned consultation requests.</p>
            </div>
            <button
              onClick={refreshBookings}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {error.bookings ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error.bookings}
            </div>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            {loading.bookings ? (
              <div className="text-sm text-slate-500">Loading bookings…</div>
            ) : bookingItems.length === 0 ? (
              <div className="text-sm text-slate-500">No assigned bookings.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Farmer</th>
                    <th className="py-2">When</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bookingItems.map((b) => (
                    <tr key={b._id} className="align-top">
                      <td className="py-3">
                        <div className="font-medium text-slate-900">{b.farmer?.name || '—'}</div>
                        <div className="text-xs text-slate-500">{b.farmer?.email || ''}</div>
                      </td>
                      <td className="py-3 text-slate-700">
                        {new Date(b.date).toLocaleDateString()} <span className="text-slate-400">•</span>{' '}
                        {b.time}
                      </td>
                      <td className="py-3 capitalize text-slate-700">{b.consultationType}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 capitalize">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setStatus(b._id, 'approved')}
                            className="rounded-lg bg-agri-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-agri-800"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setStatus(b._id, 'rejected')}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setStatus(b._id, 'completed')}
                            className="rounded-lg bg-earth-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-earth-800"
                          >
                            Complete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Consultation Room</h2>
            <p className="mt-1 text-sm text-slate-600">
              UI placeholder for real-time consultation chat.
            </p>
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Build chat + recommendations view here when the backend consultation endpoints are ready.
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">{editingId ? 'Edit Article' : 'Create Article'}</h2>
          <p className="mt-1 text-sm text-slate-600">Publish agricultural advice for farmers.</p>

          {error.saving ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error.saving}
            </div>
          ) : null}

          <form className="mt-4 space-y-3" onSubmit={saveArticle}>
            <div>
              <label className="text-sm font-medium text-slate-700">Title</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-agri-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Content</label>
              <textarea
                className="mt-1 min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-agri-500"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={loading.saving}
                className="rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800 disabled:opacity-60"
              >
                {loading.saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Articles</h2>
              <p className="mt-1 text-sm text-slate-600">Edit or delete your posts.</p>
            </div>
            <button
              onClick={refreshArticles}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {error.articles ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error.articles}
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {loading.articles ? (
              <div className="text-sm text-slate-500">Loading articles…</div>
            ) : articles.length === 0 ? (
              <div className="text-sm text-slate-500">No articles yet.</div>
            ) : (
              articles.map((a) => (
                <div key={a._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                      <div className="mt-1 line-clamp-2 text-sm text-slate-700">{a.content}</div>
                      <div className="mt-2 text-xs text-slate-500">
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        onClick={() => startEdit(a)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeArticle(a._id)}
                        className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          </section>
        </div>
      </main>
    </div>
  );
}

