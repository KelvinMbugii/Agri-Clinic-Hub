import { useEffect, useMemo, useState } from 'react';
import Chatbot from '../components/Chatbot.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import BookingForm from '../components/BookingForm.jsx';
import { getArticlesRequest, getMyBookingsRequest } from '../services/api.js';

export default function FarmerDashboard() {
  const [articles, setArticles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState({ articles: true, bookings: true });
  const [error, setError] = useState({ articles: '', bookings: '' });

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

    (async () => {
      setLoading((s) => ({ ...s, bookings: true }));
      setError((s) => ({ ...s, bookings: '' }));
      try {
        const data = await getMyBookingsRequest();
        if (!cancelled) setBookings(data?.bookings || []);
      } catch (err) {
        if (!cancelled) {
          setError((s) => ({
            ...s,
            bookings: err?.response?.data?.message || 'Failed to load bookings'
          }));
        }
      } finally {
        if (!cancelled) setLoading((s) => ({ ...s, bookings: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const bookingItems = useMemo(() => bookings || [], [bookings]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Farmer Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload an image for disease detection, book a consultation, and read expert articles.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">AI Chatbot</h2>
            <p className="mt-1 text-sm text-slate-600">
              UI placeholder. Ask about crops, pests, and best practices.
            </p>
            <div className="mt-4">
              <Chatbot />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Disease Detection</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload a clear photo of the affected leaf/plant part.
            </p>
            <div className="mt-4">
              <ImageUpload />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Book a Consultation</h2>
            <p className="mt-1 text-sm text-slate-600">
              Enter details and an officer ID (from your local office directory).
            </p>
            <div className="mt-4">
              <BookingForm onBooked={setBookings} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">My Bookings</h2>
            {error.bookings ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error.bookings}
              </div>
            ) : null}
            <div className="mt-4 space-y-3">
              {loading.bookings ? (
                <div className="text-sm text-slate-500">Loading bookings…</div>
              ) : bookingItems.length === 0 ? (
                <div className="text-sm text-slate-500">No bookings yet.</div>
              ) : (
                bookingItems.map((b) => (
                  <div
                    key={b._id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {b.consultationType} consultation
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {new Date(b.date).toLocaleDateString()} • {b.time}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          Officer: {b.officer?.name || b.officer}
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 capitalize">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">News Feed</h2>
            <p className="mt-1 text-sm text-slate-600">Articles from agricultural officers.</p>
            {error.articles ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error.articles}
              </div>
            ) : null}
            <div className="mt-4 space-y-3">
              {loading.articles ? (
                <div className="text-sm text-slate-500">Loading articles…</div>
              ) : articles.length === 0 ? (
                <div className="text-sm text-slate-500">No articles published yet.</div>
              ) : (
                articles.slice(0, 5).map((a) => (
                  <article key={a._id} className="rounded-xl border border-slate-200 p-3">
                    <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                    <div className="mt-1 line-clamp-3 text-sm text-slate-700">{a.content}</div>
                    <div className="mt-2 text-xs text-slate-500">
                      By {a.author?.name || 'Officer'} •{' '}
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

