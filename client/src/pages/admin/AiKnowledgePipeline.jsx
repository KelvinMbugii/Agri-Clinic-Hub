import Sidebar from '../../components/Sidebar.jsx';
import AiDataPanel from '../../components/admin/AiDataPanel.jsx';

export default function AiKnowledgePipeline() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:flex lg:gap-6">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">
            Intelligent Knowledge Pipeline
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Govern the core RAG database. Extract unstructured text into structured vectors, add manual disease records, and trigger dynamic Pinecone dataset retraining to keep the Gemini assistant up to date.
          </p>
        </div>

        <AiDataPanel />
      </main>
    </div>
  );
}
