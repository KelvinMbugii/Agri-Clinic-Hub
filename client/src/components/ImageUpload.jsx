import { useEffect, useMemo, useState } from 'react';
import { detectDiseaseRequest } from '../services/api.js';

export default function ImageUpload() {
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
      setResult(data?.detection || null);
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
              <div className="text-xs font-medium text-agri-800">Detected disease</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {result.detectedDisease}
              </div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="text-xs font-medium text-amber-900">Confidence</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {result.confidenceScore}%
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-700">Recommended action</div>
              <div className="mt-2 text-sm text-slate-700">{result.recommendations}</div>
            </div>
            <button
              type="button"
              className="w-full rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-agri-800"
            >
              Ask AI about this result
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
