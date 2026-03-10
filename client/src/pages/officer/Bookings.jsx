import { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import {
  getAssignedBookingsRequest,
  updateBookingStatusRequest,
} from "../../services/api";

export default function OfficerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState({ bookings: true, saving: false });
  const [error, setError] = useState({ bookings: "", saving: "" });

  const refreshBookings = async () => {
    setLoading((s) => ({ ...s, bookings: true }));
    setError((s) => ({ ...s, bookings: "" }));

    try {
      const data = await getAssignedBookingsRequest();
      setBookings(data?.bookings || []);
    } catch (err) {
      setError((s) => ({
        ...s,
        bookings:
          err?.response?.data?.message || "Failed to load assigned bookings",
      }));
    } finally {
      setLoading((s) => ({ ...s, bookings: false }));
    }
  };

  useEffect(() => {
    refreshBookings();
  }, []);

  const bookingItems = useMemo(() => bookings, [bookings]);

  const setStatus = async (bookingId, status) => {
    setLoading((s) => ({ ...s, saving: true }));
    setError((s) => ({ ...s, bookings: "" }));

    try {
      await updateBookingStatusRequest(bookingId, status);
      await refreshBookings();
    } catch (err) {
      setError((s) => ({
        ...s,
        bookings:
          err?.response?.data?.message || "Failed to update booking status",
      }));
    } finally {
      setLoading((s) => ({ ...s, saving: false }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Booking Management
        </h1>

        {error.bookings && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error.bookings}
          </div>
        )}

        <div className="mt-6 rounded-2xl border bg-white p-5">
          {loading.bookings ? (
            <div className="text-sm text-slate-500">Loading bookings…</div>
          ) : bookingItems.length === 0 ? (
            <div className="text-sm text-slate-500">No assigned bookings.</div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {bookingItems.map((b) => (
                  <article
                    key={b._id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="font-semibold text-slate-900">
                      {b.farmer?.name || "—"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {b.farmer?.email || ""}
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      {new Date(b.date).toLocaleDateString()} • {b.time}
                    </div>
                    <div className="mt-1 text-sm capitalize text-slate-700">
                      {b.consultationType}
                    </div>
                    <div className="mt-2">
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium capitalize text-amber-900">
                        {b.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => setStatus(b._id, "approved")}
                        disabled={loading.saving}
                        className="rounded-lg bg-agri-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-agri-800 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setStatus(b._id, "rejected")}
                        disabled={loading.saving}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => setStatus(b._id, "completed")}
                        disabled={loading.saving}
                        className="rounded-lg bg-earth-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-earth-800 disabled:opacity-60"
                      >
                        Complete
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left text-sm">
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
                          <div className="font-medium text-slate-900">
                            {b.farmer?.name || "—"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {b.farmer?.email || ""}
                          </div>
                        </td>
                        <td className="py-3 text-slate-700">
                          {new Date(b.date).toLocaleDateString()}{" "}
                          <span className="text-slate-400">•</span> {b.time}
                        </td>
                        <td className="py-3 capitalize text-slate-700">
                          {b.consultationType}
                        </td>
                        <td className="py-3">
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 capitalize">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setStatus(b._id, "approved")}
                              disabled={loading.saving}
                              className="rounded-lg bg-agri-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-agri-800 disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setStatus(b._id, "rejected")}
                              disabled={loading.saving}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-60"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setStatus(b._id, "completed")}
                              disabled={loading.saving}
                              className="rounded-lg bg-earth-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-earth-800 disabled:opacity-60"
                            >
                              Complete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
