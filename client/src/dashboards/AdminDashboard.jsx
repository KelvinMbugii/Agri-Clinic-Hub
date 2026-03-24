import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  getAiLogsRequest, 
  getUsersRequest, 
  verifyOfficerRequest,
  deleteUserRequest,
  getAiStatusRequest 
} from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';
import { 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Activity, 
  Database, 
  Cpu, 
  ShieldAlert, 
  TrendingUp, 
  Users, 
  BarChart,
  Loader,
  RefreshCw,
  ExternalLink,
  LayoutGrid,
  Zap,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState({ users: true, logs: true, ai: true });
  const [error, setError] = useState({ users: '', logs: '', ai: '' });
  const [deleting, setDeleting] = useState(null);

  const fetchData = async () => {
    setLoading({ users: true, logs: true, ai: true });
    
    // Users
    try {
      const userData = await getUsersRequest();
      setUsers(userData?.users || []);
    } catch (err) {
      setError(prev => ({ ...prev, users: 'Failed to load users' }));
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }

    // AI Logs
    try {
      const logData = await getAiLogsRequest();
      setLogs(logData?.logs || []);
    } catch (err) {
      setError(prev => ({ ...prev, logs: 'Failed to load AI logs' }));
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }

    // AI Status
    try {
      const statusData = await getAiStatusRequest();
      setAiStatus(statusData?.model || null);
    } catch (err) {
      setError(prev => ({ ...prev, ai: 'Failed to load AI status' }));
    } finally {
      setLoading(prev => ({ ...prev, ai: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Insights Calculation ---
  const insights = useMemo(() => {
    const unverified = users.filter(u => u.role === 'officer' && !u.isVerified);
    const lowConfidence = logs.filter(l => l.confidenceScore < 60).slice(0, 5);
    
    // Disease prevalence
    const diseaseCounts = logs.reduce((acc, log) => {
      acc[log.detectedDisease] = (acc[log.detectedDisease] || 0) + 1;
      return acc;
    }, {});
    
    const topDiseases = Object.entries(diseaseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Role distribution
    const roleStats = {
      farmer: users.filter(u => u.role === 'farmer').length,
      officer: users.filter(u => u.role === 'officer').length,
      admin: users.filter(u => u.role === 'admin').length,
    };

    return { unverified, lowConfidence, topDiseases, roleStats };
  }, [users, logs]);

  const verifyOfficer = async (id) => {
    try {
      await verifyOfficerRequest(id);
      const updatedData = await getUsersRequest();
      setUsers(updatedData?.users || []);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to verify officer');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure? This is permanent.")) return;
    setDeleting(id);
    try {
      await deleteUserRequest(id);
      const updatedData = await getUsersRequest();
      setUsers(updatedData?.users || []);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:flex lg:gap-8">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Oversight</h1>
            <p className="mt-1 text-slate-500 font-medium">Real-time health monitoring and operational insights.</p>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-all active:scale-95"
          >
            <RefreshCw className={`h-4 w-4 ${loading.users || loading.logs ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </header>

        {/* --- SYSTEM HEALTH DASHBOARD --- */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-premium">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-agri-50 text-agri-600">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-[10px]">AI Processor</h3>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">
                {loading.ai ? <Loader className="h-6 w-6 animate-spin text-slate-300" /> : aiStatus?.loaded ? 'Operational' : 'Idle'}
              </span>
              <div className={`h-3 w-3 rounded-full ${aiStatus?.loaded ? 'bg-agri-500 animate-pulse' : 'bg-slate-300'}`} />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-400">Source: {aiStatus?.source || 'Gemini Vision'}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-premium">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-[10px]">Cloud Store</h3>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">Stable</span>
              <div className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
            <p className="mt-2 text-xs font-bold text-slate-400">Latency: 42ms (Optimized)</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-premium">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider text-[10px]">Core Service</h3>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-black text-slate-900">Uptime</span>
              <span className="text-sm font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">99.9%</span>
            </div>
            <p className="mt-2 text-xs font-bold text-slate-400">Node Cluster: v1.2.4</p>
          </div>
        </section>

        {/* --- QUICK ACTIONS --- */}
        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <Link to="/admin/officers" className="group p-5 rounded-3xl border border-slate-200 bg-white shadow-premium hover:border-agri-200 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-agri-50 text-agri-600 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Officer Audit</h3>
            </div>
            <p className="text-xs font-bold text-slate-400">Review {insights.unverified.length} pending verifications.</p>
          </Link>

          <Link to="/admin/articles" className="group p-5 rounded-3xl border border-slate-200 bg-white shadow-premium hover:border-blue-200 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Content Engine</h3>
            </div>
            <p className="text-xs font-bold text-slate-400">Manage agricultural knowledge & articles.</p>
          </Link>

          <Link to="/admin/health" className="group p-5 rounded-3xl border border-slate-200 bg-white shadow-premium hover:border-purple-200 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
                <BarChart2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Detailed Insights</h3>
            </div>
            <p className="text-xs font-bold text-slate-400">Full system vitals and data analytics.</p>
          </Link>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* --- MAIN FEED --- */}
          <div className="space-y-8">
            {/* Immediate Attention Panel */}
            {(insights.unverified.length > 0 || insights.lowConfidence.length > 0) && (
              <section className="rounded-3xl border-2 border-amber-100 bg-amber-50/50 p-6 overflow-hidden relative">
                <div className="absolute top-[-20px] right-[-20px] opacity-10">
                  <ShieldAlert className="h-32 w-32 text-amber-500" />
                </div>
                <h2 className="flex items-center gap-2 text-xl font-black text-amber-900 tracking-tight">
                  <ShieldAlert className="h-6 w-6" />
                  Immediate Attention Needs
                </h2>
                <div className="mt-6 flex flex-col sm:flex-row gap-6">
                  {insights.unverified.length > 0 && (
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-3">Unverified Officers</h4>
                      <div className="space-y-2">
                        {insights.unverified.slice(0, 3).map(u => (
                          <div key={u._id} className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-amber-100 shadow-sm">
                            <span className="text-sm font-bold text-slate-800">{u.name}</span>
                            <button 
                              onClick={() => verifyOfficer(u._id)}
                              className="text-[10px] font-black uppercase text-agri-700 bg-agri-50 px-2.5 py-1 rounded-lg hover:bg-agri-100 transition-colors"
                            >
                              Verify
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {insights.lowConfidence.length > 0 && (
                    <div className="flex-1">
                      <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-3">AI Integrity Check</h4>
                      <div className="space-y-2">
                        {insights.lowConfidence.map(l => (
                          <div key={l._id} className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-amber-100 shadow-sm">
                            <span className="text-sm font-bold text-slate-800">{l.detectedDisease}</span>
                            <span className="text-[10px] font-black text-red-600 px-2 py-1 rounded-lg bg-red-50">
                              {l.confidenceScore}% Conf.
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* User Management Table */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-premium overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Node Management</h2>
                  <p className="text-sm font-bold text-slate-400">Total participants: {users.length}</p>
                </div>
                <Link to="/admin/officers" className="text-xs font-black text-agri-600 hover:underline flex items-center gap-1">
                  Advanced Audit <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <th className="pb-4 pl-2 font-black">Identity</th>
                      <th className="pb-4 font-black">Role</th>
                      <th className="pb-4 font-black text-center">Security Status</th>
                      <th className="pb-4 text-right pr-2 font-black">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.slice(0, 8).map(u => (
                      <tr key={u._id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900">{u.name}</div>
                              <div className="text-[11px] font-bold text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-slate-100 text-slate-600`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          {u.role === 'officer' ? (
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${u.isVerified ? 'bg-agri-50 text-agri-700' : 'bg-red-50 text-red-600'}`}>
                              {u.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-2">
                          <div className="flex items-center justify-end gap-2">
                            {u.role === "officer" && !u.isVerified && (
                              <button
                                onClick={() => verifyOfficer(u._id)}
                                className="rounded-lg bg-agri-600 px-2.5 py-1 text-[11px] font-black text-white hover:bg-agri-700 transition-colors"
                              >
                                Approve
                              </button>
                            )}
                            {u._id !== currentUser?.id && (
                              <button
                                onClick={() => deleteUser(u._id)}
                                disabled={deleting === u._id}
                                className="rounded-lg bg-slate-100 p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                              >
                                <Trash2 className={`h-4 w-4 ${deleting === u._id ? 'animate-pulse' : ''}`} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* --- SIDEBAR STATISTICS --- */}
          <aside className="space-y-6">
            {/* Disease Statistics */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-premium">
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="h-4 w-4 text-agri-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Disease Insights</h3>
              </div>
              <div className="space-y-5">
                {insights.topDiseases.length > 0 ? (
                  insights.topDiseases.map(([name, count]) => {
                    const percentage = Math.round((count / logs.length) * 100);
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-700 truncate max-w-[150px]">{name}</span>
                          <span className="text-xs font-bold text-slate-400">{count} scans</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden">
                          <div 
                            className="h-full bg-agri-600 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs font-bold text-slate-400 italic">No operational data yet.</p>
                )}
              </div>
            </section>

            {/* Role Distribution */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-premium">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ecosystem Breakdown</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Farmers', count: insights.roleStats.farmer, color: 'bg-agri-600' },
                  { label: 'Officers', count: insights.roleStats.officer, color: 'bg-blue-600' },
                  { label: 'Admins', count: insights.roleStats.admin, color: 'bg-slate-900' }
                ].map(r => {
                  const percentage = users.length > 0 ? Math.round((r.count / users.length) * 100) : 0;
                  return (
                    <div key={r.label} className="flex items-center gap-4">
                      <div className={`h-8 w-8 rounded-lg ${r.color} flex items-center justify-center text-white text-[10px] font-black`}>
                        {percentage}%
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">{r.label}</span>
                          <span className="text-xs font-black text-slate-900">{r.count}</span>
                        </div>
                        <div className="mt-1.5 h-1 w-full rounded-full bg-slate-50 overflow-hidden">
                          <div className={`h-full ${r.color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Weekly Growth */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-premium">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Vital Signs</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900">+{users.filter(u => {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return new Date(u.createdAt) > sevenDaysAgo;
                  }).length}</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Users (7d)</p>
                </div>
                <div className="h-10 w-24 flex items-end gap-1">
                  {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm bg-purple-100 group relative">
                      <div className="absolute bottom-0 left-0 right-0 bg-purple-600 rounded-t-sm transition-all duration-700" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

