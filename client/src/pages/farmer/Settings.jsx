import FarmerLayout from '../../components/FarmerLayout.jsx';

export default function Settings() {
  return (
    <FarmerLayout title="Settings" subtitle="Manage your profile and notifications">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
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
                placeholder="+123 456 789"
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

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              Weather alerts
              <input type="checkbox" className="h-4 w-4 accent-agri-700" defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              Consultation reminders
              <input type="checkbox" className="h-4 w-4 accent-agri-700" defaultChecked />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              New articles
              <input type="checkbox" className="h-4 w-4 accent-agri-700" />
            </label>
          </div>
        </section>
      </div>
    </FarmerLayout>
  );
}
