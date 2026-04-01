import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  chatRequest,
  clearChatHistoryRequest,
  getChatHistoryRequest,
} from "../services/api";

function makeId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {}
  return `m_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

const defaultMessage = {
  id: "m1",
  from: "bot",
  text: "Hi! I am your Agri-Clinic AI assistant. Ask me about your latest scan, crop treatments, or any farming question.",
};

export default function Chatbot() {
  const [messages, setMessages] = useState([defaultMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [lastDetection, setLastDetection] = useState(null);

  // 1. Sync Context (load last scan)
  useEffect(() => {
    const stored = localStorage.getItem('ach_lastDetection');
    if (stored) {
      try {
        setLastDetection(JSON.parse(stored));
      } catch (err) {
        console.warn("Failed to parse last scan in widget:", err);
      }
    }
  }, []);

  // 2. Load History
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getChatHistoryRequest();
        if (Array.isArray(res?.messages) && res.messages.length > 0) {
          const restored = res.messages.map(m => ({
            id: m.id || makeId(),
            from: m.from || (m.sender === "user" ? "user" : "bot"),
            text: m.text,
            ts: m.ts || Date.now()
          }));
          setMessages(restored);
        }
      } catch (error) {
        console.error("Failed to load chat history", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  const send = async (e) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: makeId(), from: "user", text: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // 3. Unified Payload (pass last scan context)
      const res = await chatRequest({ 
        message: trimmed,
        lastDetection: lastDetection // Crucial context passing
      });

      const botMsg = {
        id: makeId(),
        from: "bot",
        text: res.reply || "I couldn't generate a response.",
        ts: Date.now()
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
          ts: Date.now()
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await clearChatHistoryRequest();
      setMessages([defaultMessage]);
    } catch (error) {
      console.error("Failed to clear chat history", error);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[500px] border border-slate-200 bg-slate-50 rounded-2xl overflow-hidden">
      {/* Context Banner */}
      {lastDetection && (
        <div className="bg-agri-50 border-b border-agri-100 px-4 py-2 flex justify-between items-center group">
          <div className="text-[10px] uppercase font-bold tracking-wider text-agri-700">
            Scanning: {lastDetection.detectedDisease}
          </div>
          <div className="text-[10px] text-slate-400 group-hover:text-slate-600">
            {lastDetection.confidenceScore}% Certain
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-auto p-4 scrollbar-thin scrollbar-thumb-slate-200">
         {loadingHistory ? (
          <div className="rounded-2xl bg-white px-4 py-2 text-xs text-slate-500 shadow-sm animate-pulse">
            Resuming conversation...
          </div>
        ) : null}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                m.from === "user"
                  ? "bg-agri-700 text-white shadow-md shadow-agri-600/20"
                  : "bg-white text-slate-800 shadow-sm border border-slate-100 prose prose-sm max-w-none"
              }`}
            >
              {m.from === "bot" ? (
                <ReactMarkdown>{m.text}</ReactMarkdown>
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-2 text-xs shadow-sm italic text-slate-500 border border-slate-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-agri-500 rounded-full animate-bounce"></div>
              Agri-Clinic Assistant is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="border-t border-slate-200 bg-white p-3">
        <form className="flex items-center gap-2" onSubmit={send}>
          <div className="flex-1">
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-agri-500 transition-colors"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lastDetection ? `Ask about your ${lastDetection.detectedDisease}...` : "Describe the symptoms..."}
            />
          </div>

          <button
            type="button"
            onClick={clearHistory}
            className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 h-9 w-9 flex items-center justify-center rounded-xl bg-agri-700 text-white hover:bg-agri-800 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {loading ? "..." : "→"}
          </button>
        </form>
      </div>
    </div>
  );
}