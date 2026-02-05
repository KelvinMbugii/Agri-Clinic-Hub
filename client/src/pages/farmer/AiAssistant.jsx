import FarmerLayout from '../../components/FarmerLayout.jsx';
import Chatbot from '../../components/Chatbot.jsx';

export default function AiAssistant() {
  return (
    <FarmerLayout title="AI Assistant" subtitle="Get clear answers in simple language">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="text-sm font-semibold text-slate-900">Context overview</div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-agri-50 px-3 py-1">Today: 24°C, humid</span>
            <span className="rounded-full bg-amber-50 px-3 py-1">Latest scan: Leaf blight</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Saved articles: 3</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Ask about treatments, weather-safe spraying windows, or next steps after a scan.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <Chatbot />
        </div>
      </div>
    </FarmerLayout>
  );
}
