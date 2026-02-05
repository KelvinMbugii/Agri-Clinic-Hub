import { useEffect, useMemo, useState } from 'react';
import FarmerLayout from '../../components/FarmerLayout.jsx';
import BookingForm from '../../components/BookingForm.jsx';
import { getMyBookingsRequest } from '../../services/api.js';

const tabs = ['Book Consultation', 'Upcoming', 'Past', 'Consultation Room'];

export default function Consultations() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMyBookingsRequest();
        if (!cancelled) setBookings(data?.bookings || []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load bookings');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const validBookings = bookings.filter((booking) => booking?.date);
    return {
      upcoming: validBookings.filter((booking) => new Date(booking.date) >= now),
      past: validBookings.filter((booking) => new Date(booking.date) < now)
    };
  }, [bookings]);

  const renderBookings = (items) => {
    if (loading) return <div className="text-sm text-slate-500">Loading bookings…</div>;
    if (error)
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      );
    if (!items.length) return <div className="text-sm text-slate-500">No records yet.</div>;

    return (
      <div className="space-y-3">
        {items.map((booking) => (
          <div
            key={booking._id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {booking.consultationType} consultation
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {new Date(booking.date).toLocaleDateString()} • {booking.time}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  Officer: {booking.officer?.name || booking.officer}
                </div>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 capitalize">
                {booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <FarmerLayout title="Consultations" subtitle="Book, join, and review sessions">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-agri-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === 'Book Consultation' ? (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Booking form</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Share your crop issue and preferred time.
                </p>
                <div className="mt-4">
                  <BookingForm onBooked={setBookings} />
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Preparation checklist</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Gather crop images or sample notes.</li>
                  <li>• Note symptoms and dates observed.</li>
                  <li>• Keep your phone charged for the call.</li>
                </ul>
              </div>
            </div>
          ) : null}

          {activeTab === 'Upcoming' ? renderBookings(upcoming) : null}
          {activeTab === 'Past' ? renderBookings(past) : null}

          {activeTab === 'Consultation Room' ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Video call</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Join with Google Meet when your officer starts the session.
                </p>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-agri-800"
                >
                  Join Google Meet
                </button>
                <div className="mt-4 text-xs text-slate-500">
                  Meeting link will appear here before your scheduled time.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">Consultation notes</h3>
                <textarea
                  className="mt-3 min-h-[140px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-agri-500 focus:outline-none"
                  placeholder="Write down recommendations and next steps..."
                />
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Shared images will appear here during the session.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </FarmerLayout>
  );
}
