import { useMemo, useState } from "react";
import { chatRequest } from "../services/api";

function makeId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {}
  return `m_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: "m1",
      from: "bot",
      text:
        "Hi! I can help with crop diseases, prevention, treatments, and best farming practices. What are you experiencing?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const lastHint = useMemo(() => {
    const text = (input || "").toLowerCase();
    if (text.includes("maize"))
      return "Try describing symptoms like mold, discoloration, or leaf spots.";
    if (text.includes("tomato"))
      return "Try asking about tomato blight or yellowing leaves.";
    if (text.includes("soil"))
      return "Try asking about soil pH or fertilizer recommendations.";
    return "Example: 'I found moldy maize grains in storage'";
  }, [input]);

  const send = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: makeId(), from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatRequest({ message: trimmed });

      const botMsg = {
        id: makeId(),
        from: "bot",
        text: res.reply || "I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          from: "bot",
          text: "⚠ Unable to connect to AI service. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50">
      {/* Messages */}
      <div className="max-h-96 space-y-3 overflow-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2 text-sm ${
                m.from === "user"
                  ? "bg-agri-700 text-white"
                  : "bg-white text-slate-800 shadow-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-2 text-sm shadow-sm">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-3">
        <form className="flex items-center gap-2" onSubmit={send}>
          <div className="flex-1">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-agri-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the symptoms..."
            />
            <div className="mt-1 text-xs text-slate-500">{lastHint}</div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="shrink-0 rounded-xl bg-agri-700 px-4 py-2 text-sm font-medium text-white hover:bg-agri-800 disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}