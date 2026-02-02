import { useState } from 'react';
import { createBookingRequest, getMyBookingsRequest } from '../services/api.js';

export default function BookingForm({ onBooked }) {
  const [officerId, setOfficerId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [consultationType, setConsultationType] = useState('online');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await createBookingRequest({
        officer: officerId,
        date,
        time,
        consultationType
      });
      setSuccess('Booking request submitted.');
      setOfficerId('');
      setDate('');
      setTime('');
      setConsultationType('online');

      // Refresh bookings list if parent provided callback
      if (typeof onBooked === 'function') {
        try {
          const updated = await getMyBookingsRequest();
          onBooked(updated?.bookings || []);
        } catch {
          // Ignore refresh errors; user can refresh by reloading.
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-agri-200 bg-agri-50 p-3 text-sm text-agri-900">
          {success}
        </div>
      ) : null}

      <div>
        <label className="text-sm font-medium text-slate-700">Officer ID</label>
        <input
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-agri-500"
          value={officerId}
          onChange={(e) => setOfficerId(e.target.value)}
          placeholder="Paste the officer’s user ID"
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Date</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-agri-500"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Time</label>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-agri-500"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Consultation type</label>
        <select
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-agri-500"
          value={consultationType}
          onChange={(e) => setConsultationType(e.target.value)}
        >
          <option value="online">Online</option>
          <option value="physical">Physical</option>
        </select>
      </div>

      <button
        className="w-full rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800 disabled:opacity-60"
        disabled={loading}
        type="submit"
      >
        {loading ? 'Submitting…' : 'Submit booking'}
      </button>
    </form>
  );
}

