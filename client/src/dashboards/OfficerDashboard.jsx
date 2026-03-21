import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import {
  CalendarDays,
  MessageSquare,
  FileText,
  Settings,
  ArrowRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import {
  getArticlesRequest,
  getAssignedBookingsRequest,
} from '../services/api.js';

const PENDING_STATUSES = new Set(['pending', 'requested', 'new']);

export default function OfficerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const [bData, aData] = await Promise.all([
          getAssignedBookingsRequest(),
          getArticlesRequest(),
        ]);
        if (!cancelled) {
          setBookings(bData?.bookings || []);
          setArticles(aData?.articles || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              'Could not load dashboard data. Try refreshing.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) =>
      PENDING_STATUSES.has(String(b.status || '').toLowerCase())
    ).length;
    return {
      total,
      pending,
      articles: articles.length,
    };
  }, [bookings, articles]);

  const recentBookings = useMemo(() => bookings.slice(0, 4), [bookings]);

  const quickLinks = [
    {
      to: '/officer/booking',
      title: 'Booking management',
      description: 'Approve, reject, or complete assigned farmer requests.',
      icon: CalendarDays,
      bg: 'bg-agri-50',
      iconColor: 'text-agri-700',
    },
    {
      to: '/officer/consultation',
      title: 'Consultations',
      description: 'View and manage consultation sessions with farmers.',
      icon: MessageSquare,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-700',
    },
    {
      to: '/officer/articles',
      title: 'Articles & guidance',
      description: 'Create and edit agricultural articles for farmers.',
      icon: FileText,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-800',
    },
    {
      to: '/officer/settings',
      title: 'Settings',
      description: 'Profile and notification preferences.',
      icon: Settings,
      bg: 'bg-slate-100',
      iconColor: 'text-slate-700',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-agri-900 px-8 py-10 md:py-12 shadow-md">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
          <div className="relative z-10 text-white">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Officer Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base font-medium opacity-90 leading-relaxed">
              Welcome back. Manage your assigned consultations, track pending requests, and publish agricultural guidance to support the farming community.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        ) : null}

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                <ClipboardList className="h-5 w-5" />
              </div>
              Assigned Bookings
            </div>
            <div className="mt-4 text-4xl font-black tracking-tight text-slate-900">
              {loading ? '—' : stats.total}
            </div>
          </div>
          <div className="group rounded-3xl border border-amber-200 bg-gradient-to-b from-white to-amber-50/30 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative flex items-center gap-3 text-sm font-bold text-amber-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-colors">
                <AlertCircle className="h-5 w-5" />
              </div>
              Needs Attention
            </div>
            <div className="relative mt-4 flex items-end justify-between">
              <div className="text-4xl font-black tracking-tight text-amber-900">
                {loading ? '—' : stats.pending}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700/80 mb-1">
                Pending / New
              </div>
            </div>
          </div>
          <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-agri-200 hover:shadow-md">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-agri-50 text-agri-600 group-hover:bg-agri-100 transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              Published Articles
            </div>
            <div className="mt-4 text-4xl font-black tracking-tight text-slate-900">
              {loading ? '—' : stats.articles}
            </div>
          </div>
        </div>

        {/* Quick links */}
        <h2 className="mt-10 text-xl font-bold tracking-tight text-slate-900">Quick Access</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-start gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-agri-200 hover:shadow-premium"
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.bg} transition-transform group-hover:scale-110 group-hover:rotate-3`}
              >
                <item.icon className={`h-6 w-6 ${item.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-slate-800 tracking-tight">{item.title}</span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-agri-600" />
                </div>
                <p className="mt-1.5 text-sm font-medium text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent bookings preview */}
        <div className="mt-10 flex items-center justify-between border-b border-slate-200/60 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Bookings</h2>
          <Link
            to="/officer/booking"
            className="group flex items-center gap-1.5 text-sm font-bold text-agri-700 hover:text-agri-800 transition-colors"
          >
            View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm font-medium text-slate-500 animate-pulse">Loading recent bookings…</div>
          ) : recentBookings.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <CalendarDays className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No recent bookings</h3>
              <p className="mt-1 text-sm font-medium text-slate-500 max-w-sm mx-auto">
                When farmers request consultations, their bookings will appear here and under your{' '}
                <Link to="/officer/booking" className="font-semibold text-agri-600 hover:underline">
                  Booking Management
                </Link>
                {' '}tab.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentBookings.map((b) => {
                const isPending = PENDING_STATUSES.has(String(b.status || '').toLowerCase());
                const statusColor = isPending 
                  ? 'bg-amber-100 text-amber-800 border-amber-200' 
                  : b.status === 'completed' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200';

                return (
                  <li key={b._id} className="flex flex-wrap items-center justify-between gap-4 p-5 transition-colors hover:bg-slate-50/80">
                    <div className="flex items-center gap-4">
                      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 sm:flex">
                        <span className="text-sm font-bold">{b.farmer?.name?.charAt(0) || 'F'}</span>
                      </div>
                      <div>
                        <div className="text-base font-bold text-slate-900">
                          {b.farmer?.name || 'Farmer'}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                          <span>{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span>·</span>
                          <span>{b.time}</span>
                          <span className="hidden sm:inline">·</span>
                          <span className="capitalize hidden sm:inline">{b.consultationType}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                      {b.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
