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
            <table className="w-full text-sm">
              {/* table body unchanged */}
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
