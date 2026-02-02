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
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="text-sm font-medium text-slate-700">Upload image</label>
          <input
            className="mt-2 block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-agri-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-agri-800"
            type="file"
            accept="image/*"
            onChange={onPick}
          />

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected crop"
              className="mt-4 aspect-video w-full rounded-xl object-cover"
            />
          ) : (
            <div className="mt-4 grid aspect-video w-full place-items-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
              Choose a clear photo to preview here.
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={analyze}
              disabled={!file || loading}
              className="rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800 disabled:opacity-60"
            >
              {loading ? 'Analyzing…' : 'Analyze'}
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

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-medium text-slate-700">AI Result</div>
          {!result ? (
            <div className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              Upload an image and click <span className="font-medium">Analyze</span> to see results.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl bg-agri-50 p-4">
                <div className="text-xs font-medium text-agri-800">Detected disease</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {result.detectedDisease}
                </div>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <div className="text-xs font-medium text-amber-900">Confidence</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {result.confidenceScore}%
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-medium text-slate-700">Recommendations</div>
                <div className="mt-2 text-sm text-slate-700">{result.recommendations}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

