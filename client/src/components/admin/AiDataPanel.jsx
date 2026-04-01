import { useState, useRef } from 'react';
import { addDiseaseKnowledgeRequest, retrainAiModelRequest, extractKnowledgeRequest, uploadKnowledgeDocumentRequest } from '../../services/api';

export default function AiDataPanel() {
  const [formData, setFormData] = useState({
    modelName: '',
    displayName: '',
    crop: '',
    description: '',
    type: 'fungal',
    severity: 'medium',
    symptoms: '',
    organic: '',
    chemical: '',
    cultural: '',
    prevention: '',
  });

  const [rawText, setRawText] = useState('');
  const [file, setFile] = useState(null);
  const [extractMode, setExtractMode] = useState(true);
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('manual');
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddKnowledge = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const payload = {
        modelName: formData.modelName.trim(),
        displayName: formData.displayName.trim(),
        crop: formData.crop.trim(),
        description: formData.description.trim(),
        type: formData.type,
        severity: formData.severity,
        symptoms: formData.symptoms.split(',').map((s) => s.trim()).filter(Boolean),
        treatment: {
          organic: formData.organic.split(',').map((s) => s.trim()).filter(Boolean),
          chemical: formData.chemical.split(',').map((s) => s.trim()).filter(Boolean),
          cultural: formData.cultural.split(',').map((s) => s.trim()).filter(Boolean),
        },
        prevention: formData.prevention.split(',').map((s) => s.trim()).filter(Boolean),
      };

      await addDiseaseKnowledgeRequest(payload);
      setStatus({ type: 'success', message: 'Disease data successfully uploaded to AI Knowledge base!' });
      setFormData({
        modelName: '', displayName: '', crop: '', description: '',
        type: 'fungal', severity: 'medium', symptoms: '',
        organic: '', chemical: '', cultural: '', prevention: '',
      });
    } catch (err) {
      setStatus({ type: 'error', message: err?.response?.data?.message || 'Failed to upload knowledge' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetrain = async () => {
    if (!window.confirm("Are you sure you want to run the full Pinecone vector ingestion process? This requires API credits.")) return;
    
    setIsRetraining(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await retrainAiModelRequest();
      setStatus({ type: 'success', message: res.message || 'Retraining initiated successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err?.response?.data?.message || 'Failed to trigger retrain' });
    } finally {
      setIsRetraining(false);
    }
  };

  const handleExtractKnowledge = async (e) => {
    e.preventDefault();
    if (rawText.trim().length < 20) {
      return setStatus({ type: 'error', message: 'Please provide more specific agricultural guide text.' });
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await extractKnowledgeRequest({ rawText, extractData: extractMode });
      setStatus({ type: 'success', message: res.message || 'Data successfully processed!' });
      setRawText('');
    } catch (err) {
      setStatus({ type: 'error', message: err?.response?.data?.message || 'AI failed to extract knowledge' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!file) {
      return setStatus({ type: 'error', message: 'Please select a PDF or TXT document.' });
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await uploadKnowledgeDocumentRequest(file, extractMode);
      
      setStatus({ type: 'success', message: res.message || 'Document processed successfully!' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: err?.response?.data?.message || 'Server error - failed to upload or parse document.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">AI Knowledge Pipeline</h2>
          <p className="mt-1 text-sm text-slate-600">
            Expand the RAG database with new disease profiles and trigger dynamic model retraining.
          </p>
        </div>
        <button
          onClick={handleRetrain}
          disabled={isRetraining}
          className="shrink-0 flex items-center gap-2 rounded-xl bg-agri-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-agri-800 disabled:opacity-60 transition"
        >
          {isRetraining ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Ingesting Vectors...
            </span>
          ) : (
            '🚀 Retrain AI Model'
          )}
        </button>
      </div>

      {status.message && (
        <div className={`mt-4 rounded-xl p-4 text-sm font-medium ${
          status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {status.message}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'manual' ? 'border-b-2 border-agri-700 text-agri-800' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'ai' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          ✨ AI Bulk Extractor
        </button>
      </div>

      {activeTab === 'manual' ? (
        <form onSubmit={handleAddKnowledge} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Display Name</label>
            <input required type="text" name="displayName" value={formData.displayName} onChange={handleChange} placeholder="e.g. Tomato Late Blight" className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-agri-600" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Model Key (Unique)</label>
            <input required type="text" name="modelName" value={formData.modelName} onChange={handleChange} placeholder="e.g. tomato_late_blight" className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-agri-600" />
          </div>
          
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Crop</label>
            <input required type="text" name="crop" value={formData.crop} onChange={handleChange} placeholder="e.g. Tomato" className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-agri-600" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none bg-white">
                <option value="fungal">Fungal</option>
                <option value="bacterial">Bacterial</option>
                <option value="viral">Viral</option>
                <option value="pest">Pest</option>
                <option value="nutrient_deficiency">Nutrient Deficiency</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Severity</label>
              <select name="severity" value={formData.severity} onChange={handleChange} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none bg-white">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-700">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows="2" placeholder="Brief pathology of the disease..." className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-agri-600"></textarea>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Symptoms (Comma separated)</label>
            <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} rows="2" placeholder="Leaf spots, wilting, yellowing..." className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-agri-600"></textarea>
          </div>
          
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Prevention Tips (Comma separated)</label>
            <textarea name="prevention" value={formData.prevention} onChange={handleChange} rows="2" placeholder="Crop rotation, well-drained soil..." className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-agri-600"></textarea>
          </div>

          <div>
             <label className="mb-1 block text-xs font-medium text-slate-700">Organic Treatment (Comma separated)</label>
             <input type="text" name="organic" value={formData.organic} onChange={handleChange} placeholder="Neem oil spray, copper fungicide..." className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-agri-600" />
          </div>

          <div>
             <label className="mb-1 block text-xs font-medium text-slate-700">Chemical Treatment (Comma separated)</label>
             <input type="text" name="chemical" value={formData.chemical} onChange={handleChange} placeholder="Mancozeb 75% WP..." className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-agri-600" />
          </div>

          <div className="md:col-span-2 flex justify-end mt-2 pt-4 border-t border-slate-100">
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-60 transition">
              {isSubmitting ? 'Saving to Database...' : '+ Save Manual Entry'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 border border-amber-200">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-amber-200/50">
               <strong>AI Processing Mode:</strong>
               <label className="flex items-center gap-2 cursor-pointer relative z-10">
                 <span className="font-semibold text-amber-900">{extractMode ? 'Structured Extraction' : 'Raw RAG Chunking'}</span>
                 <input type="checkbox" className="sr-only" checked={extractMode} onChange={() => setExtractMode(!extractMode)} />
                 <div className={`w-10 h-5 rounded-full shadow-inner transition ${extractMode ? 'bg-amber-600' : 'bg-slate-300'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full mt-1 transition-transform ${extractMode ? 'translate-x-6' : 'translate-x-1'}`}></div>
                 </div>
               </label>
            </div>
            {extractMode ? 
              "Upload or paste raw text. The AI will intelligently extract the symptoms, treatments, and descriptions, format it to the database schema, and seed it instantly."
              :
              "Bypass extraction! The document will be directly split into mathematical text chunks and preserved literally inside the vector database for conversational RAG queries."
            }
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            {/* File Upload Form */}
            <form onSubmit={handleUploadDocument} className="flex flex-col gap-4 md:pr-4 pt-4 md:pt-0">
              <h3 className="font-semibold text-slate-800">Upload Extractor</h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Select Document (.pdf, .txt)</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 border-slate-300 hover:bg-slate-100 ${file ? 'border-amber-400 bg-amber-50/50' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="text-sm text-slate-500 font-medium">{file ? file.name : "Click to upload document"}</p>
                    </div>
                    <input id="dropzone-file" ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div className="flex justify-end mt-auto">
                <button type="submit" disabled={isSubmitting || !file} className="rounded-xl w-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-60 transition flex items-center justify-center gap-2">
                  {isSubmitting ? 'Parsing...' : '📄 Extract File'}
                </button>
              </div>
            </form>

            {/* Raw Text Form */}
            <form onSubmit={handleExtractKnowledge} className="flex flex-col gap-4 md:pl-4 pt-4 md:pt-0">
               <h3 className="font-semibold text-slate-800">Raw Text Extractor</h3>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">Paste Text</label>
                <textarea required value={rawText} onChange={(e) => setRawText(e.target.value)} rows="5" placeholder="Paste agricultural guidelines here..." className="w-full rounded-2xl border border-slate-300 p-4 text-sm outline-none focus:border-amber-500 shadow-inner leading-relaxed"></textarea>
              </div>
              
              <div className="flex justify-end mt-auto pt-2">
                <button type="submit" disabled={isSubmitting || !rawText.trim()} className="rounded-xl w-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-60 transition flex items-center justify-center gap-2">
                  {isSubmitting ? 'Parsing...' : '📝 Extract Text'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
