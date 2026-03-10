import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar.jsx";
import { getUsersRequest, verifyOfficerRequest } from "../../services/api.js";

export default function AdminOfficersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const refreshUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsersRequest();
      setUsers(data?.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const officers = useMemo(
    () => users.filter((u) => u.role === "officer"),
    [users],
  );

  const verifyOfficer = async (id) => {
    setSavingId(id);
    setError("");
    try {
      await verifyOfficerRequest(id);
      await refreshUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to verify officer");
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Officers Management
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Review officer accounts and verify pending users.
            </p>
          </div>
          <button
            onClick={refreshUsers}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          {loading ? (
            <div className="text-sm text-slate-500">Loading officers…</div>
          ) : officers.length === 0 ? (
            <div className="text-sm text-slate-500">
              No officer accounts found.
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {officers.map((o) => (
                  <article
                    key={o._id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="font-semibold text-slate-900">{o.name}</div>
                    <div className="text-sm text-slate-600 break-all">
                      {o.email}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Status</div>
                    <div className="mt-1">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${o.isVerified ? "bg-agri-100 text-agri-800" : "bg-amber-100 text-amber-900"}`}
                      >
                        {o.isVerified ? "verified" : "pending"}
                      </span>
                    </div>
                    {!o.isVerified ? (
                      <button
                        onClick={() => verifyOfficer(o._id)}
                        disabled={savingId === o._id}
                        className="mt-3 rounded-lg bg-agri-700 px-3 py-2 text-xs font-medium text-white hover:bg-agri-800 disabled:opacity-60"
                      >
                        {savingId === o._id ? "Verifying…" : "Verify"}
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {officers.map((o) => (
                      <tr key={o._id}>
                        <td className="py-3 font-medium text-slate-900">
                          {o.name}
                        </td>
                        <td className="py-3 text-slate-700">{o.email}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${o.isVerified ? "bg-agri-100 text-agri-800" : "bg-amber-100 text-amber-900"}`}
                          >
                            {o.isVerified ? "verified" : "pending"}
                          </span>
                        </td>
                        <td className="py-3">
                          {o.isVerified ? (
                            <span className="text-xs text-slate-500">
                              No action
                            </span>
                          ) : (
                            <button
                              onClick={() => verifyOfficer(o._id)}
                              disabled={savingId === o._id}
                              className="rounded-lg bg-agri-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-agri-800 disabled:opacity-60"
                            >
                              {savingId === o._id ? "Verifying…" : "Verify"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
