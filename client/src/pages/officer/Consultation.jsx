import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import {
  getAssignedBookingsRequest,
  updateBookingStatusRequest,
} from "../../services/api";
import { 
  Video, 
  MapPin, 
  User, 
  Clock, 
  Calendar, 
  CheckCircle,
  ExternalLink,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function OfficerConsultations() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const fetchApprovedBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAssignedBookingsRequest();
      // Only show approved bookings that are not yet completed
      const approved = (data?.bookings || [])
        .filter((b) => b.status === "approved")
        .sort((a, b) => {
          const dateDiff = new Date(a.date) - new Date(b.date);
          if (dateDiff !== 0) return dateDiff;
          return (a.time || '').localeCompare(b.time || '');
        });
      setBookings(approved);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load active consultations"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedBookings();
  }, []);

  const handleComplete = async (bookingId) => {
    if (!window.confirm("Mark this consultation as completed?")) return;
    
    setUpdating(bookingId);
    try {
      await updateBookingStatusRequest(bookingId, "completed");
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Consultation Room
          </h1>
          <p className="mt-1 text-slate-500 font-medium">
            Manage your active sessions and jump into live consultations.
          </p>
        </header>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-sm">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-agri-600" />
            <p className="mt-4 text-sm font-bold text-slate-500 tracking-tight">
              Loading active sessions...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              No Active Consultations
            </h3>
            <p className="mt-2 text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
              Approved bookings will appear here. Go to the{" "}
              <a href="/officer/booking" className="text-agri-600 hover:underline">
                Booking Management
              </a>{" "}
              tab to approve new requests.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-agri-200 hover:shadow-premium"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 shadow-sm group-hover:scale-110 transition-transform">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                          {booking.farmer?.name || "Farmer"}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {booking.farmer?.email}
                        </p>
                      </div>
                    </div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${
                      booking.consultationType === "online" 
                        ? "bg-blue-50 text-blue-600" 
                        : "bg-amber-50 text-amber-600"
                    }`}>
                      {booking.consultationType === "online" ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-4 border-y border-slate-50 py-5">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {booking.time}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    {booking.consultationType === "online" && (
                      <a
                        href={booking.meetingLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-sm transition-all hover:scale-[1.02] ${
                          booking.meetingLink
                            ? "bg-agri-600 text-white hover:bg-agri-700"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                        onClick={(e) => !booking.meetingLink && e.preventDefault()}
                      >
                        {booking.meetingLink ? (
                          <>
                            Join Meeting <ExternalLink className="h-4 w-4" />
                          </>
                        ) : (
                          "Link Missing"
                        )}
                      </a>
                    )}
                    <button
                      onClick={() => handleComplete(booking._id)}
                      disabled={updating === booking._id}
                      className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-200 hover:scale-[1.02] disabled:opacity-50"
                    >
                      {updating === booking._id ? (
                        <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                      ) : (
                        "Mark Done"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
