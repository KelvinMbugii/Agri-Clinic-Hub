import { useMemo, useState } from 'react';

function makeId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    // ignore
  }
  return `m_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function Chatbot() {
  const [messages, setMessages] = useState(() => [
    {
      id: 'm1',
      from: 'bot',
      text: 'Hi! I can help with crop care, pests, soil health, and best practices (UI only). What do you want to ask?'
    }
  ]);
  const [input, setInput] = useState('');

  const lastHint = useMemo(() => {
    const text = (input || '').toLowerCase();
    if (text.includes('maize')) return 'Try asking about maize leaf spots, fertilizer, or irrigation schedule.';
    if (text.includes('tomato')) return 'Try asking about tomato blight prevention and spacing.';
    if (text.includes('soil')) return 'Try asking about soil testing and pH adjustment.';
    return 'Try: “How do I prevent leaf blight?”';
  }, [input]);

  const send = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { id: makeId(), from: 'user', text: trimmed };

    // UI-only placeholder response
    const botMsg = {
      id: makeId(),
      from: 'bot',
      text:
        'Thanks — this is a UI placeholder. When the chatbot API is wired, I’ll respond with tailored guidance.'
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50">
      <div className="max-h-64 space-y-3 overflow-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.from === 'user'
                  ? 'bg-agri-700 text-white'
                  : 'bg-white text-slate-800 shadow-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 bg-white p-3">
        <form className="flex items-center gap-2" onSubmit={send}>
          <div className="flex-1">
            <label className="sr-only" htmlFor="chat-input">
              Message
            </label>
            <input
              id="chat-input"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-agri-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
            />
            <div className="mt-1 text-xs text-slate-500">{lastHint}</div>
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-agri-700 px-3 py-2 text-sm font-medium text-white hover:bg-agri-800"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

