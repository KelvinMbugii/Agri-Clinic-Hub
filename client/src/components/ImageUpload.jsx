import { useEffect, useMemo, useState } from 'react';
import { detectDiseaseRequest } from '../services/api.js';

export default function ImageUpload({ onDetection, onAskAi }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onPick = (e) => {
    setError('');
    setResult(null);
    const next = e.target.files?.[0] || null;
    setFile(next);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setError('');
    setResult(null);
    const next = event.dataTransfer.files?.[0] || null;
    setFile(next);
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const data = await detectDiseaseRequest(file);
      const detection = data?.detection || null;
      setResult(detection);
      if (onDetection && detection) {
        onDetection(detection);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

const toLines = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value
        .split(/\r?\n|•|;|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const recommendedLines = [
    result?.aiInsights?.description || result?.description,
    ...toLines(result?.aiInsights?.organicTreatment || result?.organicTreatment),
    ...toLines(result?.aiInsights?.chemicalTreatment || result?.chemicalTreatment),
    ...toLines(result?.aiInsights?.prevention || result?.prevention)
  ].filter(Boolean);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Upload crop image</h3>
          <p className="text-sm text-slate-600">
            Drag and drop a clear photo of the affected crop or click to browse.
          </p>
        </div>

        <label
          htmlFor="crop-image"
          onDrop={onDrop}
          onDragOver={onDragOver}
          className="mt-5 flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-agri-200 bg-agri-50/60 p-4 text-center text-sm text-slate-600 transition hover:border-agri-400"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected crop"
              className="max-h-64 w-full rounded-2xl object-cover"
            />
          ) : (
            <div>
              <div className="text-base font-semibold text-slate-800">
                Drop image here
              </div>
              <div className="mt-1 text-sm text-slate-600">
                or tap to choose from your phone
              </div>
              <div className="mt-3 text-xs text-slate-500">
                JPG or PNG • Max 10MB
              </div>
            </div>
          )}
        </label>
        <input
          id="crop-image"
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={onPick}
        />

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={analyze}
            disabled={!file || loading}
            className="rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800 disabled:opacity-60"
          >
            {loading ? 'Analyzing…' : 'Analyze image'}
          </button>
          <button
            onClick={reset}
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Reset
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="text-sm font-medium text-slate-700">AI Result</div>
        {!result ? (
          <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Upload an image and click <span className="font-medium">Analyze</span> to see results.
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <div className="rounded-2xl bg-agri-50 p-4">
              <div className="text-xs font-medium text-agri-800">Primary Detection</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {result.detectedDisease || "No clear disease detected"}
              </div>
            </div>

            {/* Confidence Breakdown */}
            {result.alternative_diagnoses?.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">📊 Probability Distribution</div>
                <div className="mt-3 space-y-3">
                  {result.alternative_diagnoses.map((alt, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span className={idx === 0 ? "font-semibold" : ""}>{alt.label}</span>
                        <span className="font-medium text-slate-500">{(alt.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? "bg-agri-600" : "bg-slate-300"}`}
                          style={{ width: `${alt.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Message (if any) */}
            {result.message ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="font-semibold text-amber-900 mb-1">⚠️ System Notice</div>
                {result.message}
              </div>
            ) : null}

            <div className="space-y-4">
              {result.aiInsights?.description || result.description ? (
                <div className="rounded-2xl border border-agri-100 bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-agri-600">🖨️ Analysis Overview</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-700">
                    {result.aiInsights?.description || result.description}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-1">
                {/* Organic Treatments */}
                {(result.aiInsights?.organicTreatment?.length || result.organicTreatment?.length) ? (
                  <div className="rounded-2xl border border-green-100 bg-green-50/30 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                      <span>🌿</span> Organic Treatments
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {toLines(result.aiInsights?.organicTreatment || result.organicTreatment).map((line, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-700">
                          <span className="text-green-500">•</span> {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Chemical Treatments */}
                {(result.aiInsights?.chemicalTreatment?.length || result.chemicalTreatment?.length) ? (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                      <span>💊</span> Chemical Solutions
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {toLines(result.aiInsights?.chemicalTreatment || result.chemicalTreatment).map((line, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-700">
                          <span className="text-amber-500">•</span> {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* Prevention */}
                {(result.aiInsights?.prevention?.length || result.prevention?.length) ? (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                      <span>🛡️</span> Prevention Plan
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {toLines(result.aiInsights?.prevention || result.prevention).map((line, i) => (
                        <li key={i} className="flex gap-2 text-xs text-slate-700">
                          <span className="text-blue-400">•</span> {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onAskAi && onAskAi(result)}
              className="mt-4 w-full rounded-xl bg-agri-700 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-agri-800 hover:shadow-md active:scale-[0.98]"
            >
              💬 Ask AI Assistant about this result
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
