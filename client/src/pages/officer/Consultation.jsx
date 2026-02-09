import Sidebar from "../../components/Sidebar.jsx";

export default function OfficerConsultations() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Consultation Room
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Prepare for real-time consultations and chat sessions.
        </p>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Live consultation workspace</h2>
          <p className="mt-1 text-sm text-slate-600">
            UI placeholder for real-time consultation chat.
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            Build chat + recommendations view here when the backend consultation
            endpoints are ready.
          </div>
        </section>
      </main>
    </div>
  );
}
