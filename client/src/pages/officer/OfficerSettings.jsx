import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar.jsx';

export default function OfficerSettings() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="mb-2">
          <Link
            to="/officer/dashboard"
            className="text-sm font-medium text-agri-700 hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your profile and notification preferences.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
            <div className="mt-4 grid gap-3">
              <label className="text-sm text-slate-600">
                Name
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-agri-500 focus:outline-none"
                  placeholder="Your full name"
                />
              </label>
              <label className="text-sm text-slate-600">
                Phone number
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-agri-500 focus:outline-none"
                  placeholder="+254 …"
                />
              </label>
            </div>
            <button
              type="button"
              className="mt-4 rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-agri-800"
            >
              Save changes
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                New booking assignments
                <input type="checkbox" className="h-4 w-4 accent-agri-700" defaultChecked />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                Consultation reminders
                <input type="checkbox" className="h-4 w-4 accent-agri-700" defaultChecked />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                Farmer messages
                <input type="checkbox" className="h-4 w-4 accent-agri-700" />
              </label>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
