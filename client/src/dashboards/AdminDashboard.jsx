import { useEffect, useMemo, useState } from 'react';
import { getAiLogsRequest, getUsersRequest, verifyOfficerRequest } from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState({ users: true, logs: true });
  const [error, setError] = useState({ users: '', logs: '' });

  const refreshUsers = async () => {
    setLoading((s) => ({ ...s, users: true }));
    setError((s) => ({ ...s, users: '' }));
    try {
      const data = await getUsersRequest();
      setUsers(data?.users || []);
    } catch (err) {
      setError((s) => ({
        ...s,
        users: err?.response?.data?.message || 'Failed to load users'
      }));
    } finally {
      setLoading((s) => ({ ...s, users: false }));
    }
  };

  const refreshLogs = async () => {
    setLoading((s) => ({ ...s, logs: true }));
    setError((s) => ({ ...s, logs: '' }));
    try {
      const data = await getAiLogsRequest();
      setLogs(data?.logs || []);
    } catch (err) {
      setError((s) => ({
        ...s,
        logs: err?.response?.data?.message || 'Failed to load AI logs'
      }));
    } finally {
      setLoading((s) => ({ ...s, logs: false }));
    }
  };

  useEffect(() => {
    refreshUsers();
    refreshLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Active users', value: users.length || 0 },
      { label: 'Officers', value: users.filter((u) => u.role === 'officer').length || 0 },
      { label: 'Verified officers', value: users.filter((u) => u.role === 'officer' && u.isVerified).length || 0 },
      { label: 'AI scans', value: logs.length || 0 }
    ],
    [users, logs]
  );

  const verifyOfficer = async (id) => {
    try {
      await verifyOfficerRequest(id);
      await refreshUsers();
    } catch (err) {
      setError((s) => ({
        ...s,
        users: err?.response?.data?.message || 'Failed to verify officer'
      }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Verify officers, review AI logs, and monitor system activity.
        </p>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft"
            >
              <div className="text-xs font-medium text-slate-500">{s.label}</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{s.value}</div>
            </div>
          ))}
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">User Management</h2>
              <p className="mt-1 text-sm text-slate-600">Verify officer accounts.</p>
            </div>
            <button
              onClick={refreshUsers}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {error.users ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error.users}
            </div>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            {loading.users ? (
              <div className="text-sm text-slate-500">Loading users…</div>
            ) : users.length === 0 ? (
              <div className="text-sm text-slate-500">No users found.</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Verified</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => (
                    <tr key={u._id} className="align-top">
                      <td className="py-3 font-medium text-slate-900">{u.name}</td>
                      <td className="py-3 text-slate-700">{u.email}</td>
                      <td className="py-3 capitalize text-slate-700">{u.role}</td>
                      <td className="py-3">
                        {u.role === 'officer' ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              u.isVerified ? 'bg-agri-100 text-agri-800' : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {u.isVerified ? 'verified' : 'pending'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        {u.role === 'officer' && !u.isVerified ? (
                          <button
                            onClick={() => verifyOfficer(u._id)}
                            className="rounded-lg bg-agri-700 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-agri-800"
                          >
                            Verify
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">AI Logs</h2>
              <p className="mt-1 text-sm text-slate-600">Recent disease detection activity.</p>
            </div>
            <button
              onClick={refreshLogs}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {error.logs ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error.logs}
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {loading.logs ? (
              <div className="text-sm text-slate-500">Loading logs…</div>
            ) : logs.length === 0 ? (
              <div className="text-sm text-slate-500">No AI logs yet.</div>
            ) : (
              logs.slice(0, 10).map((l) => (
                <div key={l._id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{l.detectedDisease}</div>
                      <div className="mt-1 text-sm text-slate-700">
                        Confidence: <span className="font-medium">{l.confidenceScore}%</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Farmer: {l.user?.name || '—'} •{' '}
                        {l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${l.imageUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
                    >
                      View image
                    </a>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">{l.recommendations}</div>
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

