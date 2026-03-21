import { useState } from "react";

export default function DiseaseResult({ data }) {
  const [tab, setTab] = useState("treatment");

  if (!data) return null;

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-6">
      {/* Disease Header */}
      <div>
        <h2 className="text-2xl font-bold">{data.detectedDisease}</h2>
        <p className="text-sm text-gray-500">
          Confidence: {data.confidenceScore}% | Severity: {data.severity}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {["treatment", "prevention"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 ${
              tab === t
                ? "border-b-2 border-green-600 font-semibold"
                : "text-gray-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tab === "treatment" && (
          <div>
            <h3 className="font-semibold mb-2">Organic</h3>
            <ul className="list-disc ml-5">
              {data.organicTreatment?.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>

            <h3 className="font-semibold mt-4 mb-2">Chemical</h3>
            <ul className="list-disc ml-5">
              {data.chemicalTreatment?.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {tab === "prevention" && (
          <ul className="list-disc ml-5">
            {data.prevention?.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        )}
      </div>

      {/* AI Insights */}
      {data.aiInsights && (
        <div className="bg-green-50 p-4 rounded-xl space-y-3">
          <h3 className="font-semibold text-green-700">AI Insights</h3>

          {data.aiInsights.extra_advice?.length > 0 && (
            <div>
              <p className="font-medium">Advice</p>
              <ul className="list-disc ml-5">
                {data.aiInsights.extra_advice.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {data.aiInsights.warnings?.length > 0 && (
            <div>
              <p className="font-medium text-red-600">Warnings</p>
              <ul className="list-disc ml-5">
                {data.aiInsights.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {data.aiInsights.best_practices?.length > 0 && (
            <div>
              <p className="font-medium">Best Practices</p>
              <ul className="list-disc ml-5">
                {data.aiInsights.best_practices.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
