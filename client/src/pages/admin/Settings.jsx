import Sidebar from "../../components/Sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Admin Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Overview of admin account and platform governance checklist.
        </p>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-slate-900">
                  {user?.name || "Admin"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900 break-all">
                  {user?.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Role</dt>
                <dd className="font-medium text-slate-900 capitalize">
                  {user?.role || "admin"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Governance checklist</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>• Verify new officer accounts daily.</li>
              <li>• Review unusual AI prompts and activity spikes.</li>
              <li>• Keep farmer-facing content reviewed weekly.</li>
              <li>• Monitor failed booking state transitions.</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
