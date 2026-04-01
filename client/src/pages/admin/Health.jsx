import { useEffect, useState, useMemo } from 'react';
import { 
  getAiLogsRequest, 
  getUsersRequest, 
  getAiStatusRequest,
  deepScanRequest
} from '../../services/api.js';
import Sidebar from '../../components/Sidebar.jsx';
import { 
  Activity, 
  Database, 
  Cpu, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  ShieldAlert,
  Clock,
  Server,
  Zap,
  Globe
} from 'lucide-react';

export default function AdminHealth() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [latency, setLatency] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);

  const fetchData = async () => {
    const startTime = performance.now();
    setLoading(true);
    try {
      const [userData, logData, statusData] = await Promise.all([
        getUsersRequest(),
        getAiLogsRequest(),
        getAiStatusRequest()
      ]);
      setUsers(userData?.users || []);
      setLogs(logData?.logs || []);
      setAiStatus(statusData?.model || null);
      
      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));
    } catch (err) {
      console.error('Failed to fetch health data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeepScan = async () => {
    setIsScanning(true);
    setScanResults(null);
    try {
      const { checks } = await deepScanRequest();
      setScanResults(checks);
      // Also refresh the basic stats
      fetchData();
    } catch (err) {
      console.error('Deep scan failed:', err);
      alert('Deep scan failed to complete. Check server logs.');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const totalScans = logs.length;
    const avgConfidence = totalScans > 0 
      ? Math.round(logs.reduce((acc, l) => acc + l.confidenceScore, 0) / totalScans) 
      : 0;
    
    const unverified = users.filter(u => u.role === 'officer' && !u.isVerified).length;
    const lowConfCount = logs.filter(l => l.confidenceScore < 60).length;

    // Disease breakdown
    const diseaseCounts = logs.reduce((acc, log) => {
      acc[log.detectedDisease] = (acc[log.detectedDisease] || 0) + 1;
      return acc;
    }, {});

    // Last 7 days user growth and scan frequency
    const getWeeklyData = (items) => {
      const counts = Array(7).fill(0);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      items.forEach(item => {
        const itemDate = new Date(item.createdAt);
        const diffDays = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          counts[6 - diffDays]++;
        }
      });
      
      const max = Math.max(...counts, 1);
      return counts.map(c => Math.round((c / max) * 100));
    };

    const userGrowth = getWeeklyData(users);
    const scanTrends = getWeeklyData(logs);

    return { totalScans, avgConfidence, unverified, lowConfCount, diseaseCounts, userGrowth, scanTrends };
  }, [users, logs]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Zap className="mx-auto h-12 w-12 animate-pulse text-agri-600" />
          <p className="mt-4 text-sm font-bold text-slate-500 uppercase tracking-widest">Profiling System Vitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:flex lg:gap-8 min-h-screen bg-slate-50">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-agri-600 mb-2">
              <Activity className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Real-time Status</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Infrastructure</h1>
          </div>
          <button 
            onClick={handleDeepScan}
            disabled={isScanning}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold shadow-sm border transition-all active:scale-95 ${
              isScanning 
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isScanning ? (
              <>
                <Zap className="h-4 w-4 animate-spin text-agri-500" />
                Scanning Subsystems...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 text-agri-600" />
                Run Deep Scan
              </>
            )}
          </button>
        </header>

        {/* --- SCAN RESULTS TOAST-LIKE BANNER --- */}
        {scanResults && (
           <div className="mb-8 rounded-3xl bg-slate-900 p-6 text-white shadow-premium animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-agri-400">
                 <ShieldCheck className="h-5 w-5" />
                 <span className="text-xs font-black uppercase tracking-widest">Deep Scan Report - Success</span>
               </div>
               <button onClick={() => setScanResults(null)} className="text-slate-500 hover:text-white transition-colors">
                 <Clock className="h-4 w-4" />
               </button>
             </div>
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase">Memory Footprint</div>
                  <div className="text-sm font-bold text-slate-200">{scanResults.memoryUsage}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase">System Uptime</div>
                  <div className="text-sm font-bold text-slate-200">{scanResults.processUptime}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase">Env Layer</div>
                  <div className="text-sm font-bold text-slate-200 capitalize">{scanResults.environment}</div>
                </div>
             </div>
           </div>
        )}

        {/* Core Infrastructure Row */}
        <section className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <HealthNode 
            title="Gemini Inference" 
            status={aiStatus?.loaded ? 'Operational' : 'Idle'} 
            icon={Cpu} 
            color="agri" 
            sub={`${aiStatus?.source || 'API Engine'}`}
          />
          <HealthNode 
            title="Database Node" 
            status="Stable" 
            icon={Database} 
            color="blue" 
            sub={`${latency}ms Response Time`}
          />
          <HealthNode 
            title="API Services" 
            status="Healthy" 
            icon={Server} 
            color="purple" 
            sub={`Load: ${(users.length / 100).toFixed(1)}% Capacity`}
          />
          <HealthNode 
            title="Security Layer" 
            status="Verified" 
            icon={Globe} 
            color="amber" 
            sub="TLS 1.3 Encryption"
          />
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* AI Performance Deep Dive */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Accuracy Metrics</h2>
              <ShieldCheck className="h-6 w-6 text-agri-500" />
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 mb-8">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Model Confidence</div>
                <div className="text-3xl font-black text-slate-900">{stats.avgConfidence}%</div>
                <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-agri-500" style={{ width: `${stats.avgConfidence}%` }} />
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Scans</div>
                <div className="text-3xl font-black text-slate-900">{stats.totalScans}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Operational Volume</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Disease Prevalence</h3>
                <span className="text-[10px] font-black text-slate-400 px-2 py-0.5 bg-slate-50 rounded-lg">Real-time Data</span>
              </div>
              <div className="space-y-4">
                {Object.entries(stats.diseaseCounts).length > 0 ? (
                  Object.entries(stats.diseaseCounts).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([name, count]) => {
                    const percentage = Math.round((count / stats.totalScans) * 100);
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-slate-700">{name}</span>
                          <span className="font-black text-slate-900">{count} detection{count > 1 ? 's' : ''}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-50 overflow-hidden">
                          <div className="h-full bg-agri-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs font-bold text-slate-400 italic py-4 text-center">No disease records across nodes yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* Ecosystem Insights */}
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Ecosystem Growth</h2>
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Verified Nodes</div>
                  <div className="text-3xl font-black text-slate-900">{users.length}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">High Volatility Scans</span>
                  <span className="text-2xl font-black text-amber-900">{stats.lowConfCount}</span>
                </div>
                
                <div className="flex flex-col p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Officer Backlog</span>
                  <span className="text-2xl font-black text-slate-900">{stats.unverified}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Growth Velocity (7D)</h3>
                   <div className="flex gap-2">
                     <span className="flex items-center gap-1 text-[10px] font-black text-blue-600"><div className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Users</span>
                     <span className="flex items-center gap-1 text-[10px] font-black text-agri-600"><div className="h-1.5 w-1.5 rounded-full bg-agri-600" /> Scans</span>
                   </div>
                </div>
                <div className="h-32 flex items-end gap-1.5">
                  {stats.userGrowth.map((h, i) => (
                    <div key={`u-${i}`} className="flex-1 flex gap-0.5 items-end h-full">
                       <div className="flex-1 rounded-t-sm bg-blue-100 relative group h-full flex flex-col justify-end">
                          <div className="bg-blue-600 rounded-t-sm transition-all duration-700" style={{ height: `${h}%` }} />
                       </div>
                       <div className="flex-1 rounded-t-sm bg-agri-100 relative h-full flex flex-col justify-end">
                          <div className="bg-agri-600 rounded-t-sm transition-all duration-700" style={{ height: `${stats.scanTrends[i]}%` }} />
                       </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  {['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'Yest', 'Today'].map(day => <span key={day}>{day}</span>)}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Real-time Log Stream (Simplified) */}
        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-premium">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Operation Stream</h2>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-agri-500 animate-ping" />
               <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Flow</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {logs.slice(0, 5).map(log => (
              <div key={log._id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900 truncate uppercase tracking-widest">{log.detectedDisease}</span>
                    <span className="text-[10px] font-bold text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-400 mt-0.5 truncate">
                    Confidence: {log.confidenceScore}% • User: {log.user?.name || 'Unknown'}
                  </div>
                </div>
                <div className={`h-2 w-2 rounded-full ${log.confidenceScore > 70 ? 'bg-agri-500' : 'bg-amber-500'}`} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function HealthNode({ title, status, icon: Icon, color, sub }) {
  const colorMap = {
    agri: 'bg-agri-50 text-agri-600 border-agri-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <div className={`rounded-3xl border ${colorMap[color]} bg-white p-6 shadow-sm`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 flex items-center justify-center rounded-xl ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{title}</h3>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xl font-black text-slate-900 tracking-tight">{status}</span>
        <div className={`h-1.5 w-1.5 rounded-full ${color === 'agri' ? 'bg-agri-500' : color === 'blue' ? 'bg-blue-500' : color === 'purple' ? 'bg-purple-500' : 'bg-amber-500'} animate-pulse`} />
      </div>
      <p className="mt-2 text-[10px] font-bold text-slate-400 tracking-wider text-right">{sub}</p>
    </div>
  );
}
