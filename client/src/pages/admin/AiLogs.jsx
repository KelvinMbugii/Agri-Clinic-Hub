import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import { getAiLogsRequest } from "../../services/api.js";

export default function AdminAiLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAiLogsRequest();
      setLogs(data?.logs || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load AI logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const uniqueUsers = new Set(
      logs.map((l) => l.user?._id || l.user).filter(Boolean),
    ).size;
    const today = new Date().toDateString();
    const todayCount = logs.filter(
      (l) => l.createdAt && new Date(l.createdAt).toDateString() === today,
    ).length;

    return { total, uniqueUsers, todayCount };
  }, [logs]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              AI Activity Logs
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Observe how AI tools are being used across the platform.
            </p>
          </div>
          <button
            onClick={refreshLogs}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="text-xs font-medium text-slate-500">Total logs</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {stats.total}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="text-xs font-medium text-slate-500">
              Unique users
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {stats.uniqueUsers}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="text-xs font-medium text-slate-500">Today</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {stats.todayCount}
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          {loading ? (
            <div className="text-sm text-slate-500">Loading logs…</div>
          ) : logs.length === 0 ? (
            <div className="text-sm text-slate-500">No logs available yet.</div>
          ) : (
            <div className="space-y-3">
              {logs.slice(0, 30).map((log) => (
                <article
                  key={log._id}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-slate-900">
                      {log.user?.name || "Unknown user"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 break-all">
                    {log.user?.email || ""}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {log.prompt || "No prompt captured."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
