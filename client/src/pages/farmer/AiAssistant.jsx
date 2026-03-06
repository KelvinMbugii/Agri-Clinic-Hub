import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import FarmerLayout from '../../components/FarmerLayout.jsx';
import { chatRequest, clearChatHistoryRequest, getChatHistoryRequest } from '../../services/api.js';

function makeId() {
  return `m_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export default function AiAssistant() {
  const location = useLocation();
  const [lastDetection, setLastDetection] = useState(null);
  const [messages, setMessages] = useState(() => [
    {
      id: 'm1',
      from: 'bot',
      text: 'Hi! I am your Agri-Clinic AI assistant. Ask me about crop diseases, fertilizers, weather timing, or farm practices.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getChatHistoryRequest();
        if (Array.isArray(data?.messages) && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, []);

  // Load detection from localStorage or location state when coming from Disease Detection
  useEffect(() => {
    const stored = localStorage.getItem('ach_lastDetection');
    const fromState = location.state?.detection;
    
    if (fromState) {
      setLastDetection(fromState);
      // Auto-send a question about the detection
      const question = `I scanned my crop and the AI detected ${fromState.detectedDisease} with ${fromState.confidenceScore}% confidence. What simple steps should I follow now?`;
      setTimeout(() => {
        sendMessage(question, fromState);
      }, 500);
      // Clear state to avoid re-triggering
      window.history.replaceState({}, document.title);
    } else if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLastDetection(parsed);
      } catch {
        // ignore parse errors
      }
    }
  }, [location.state]);

  const sendMessage = async (text, detectionContext = null) => {
    const trimmed = typeof text === 'string' ? text.trim() : '';
    if (!trimmed) return;

    const userMsg = {
      id: makeId(),
      from: 'user',
      text: trimmed,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (typeof text === 'string') {
      setInput('');
    }
    setError('');
    setSending(true);

    try {
      const payload = {
        message: trimmed,
        lastDetection: detectionContext || lastDetection,
      };
      const data = await chatRequest(payload);
      const replyText =
        data?.reply || 'I could not generate a helpful answer right now.';

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          from: 'bot',
          text: replyText,
          ts: Date.now(),
        },
      ]);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Chat failed. Please try again in a moment.';

      setError(msg);

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          from: 'bot',
          text: msg,
          ts: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const clearChat = async () => {
    try {
      await clearChatHistoryRequest();
      setMessages([
        {
          id: 'm1',
          from: 'bot',
          text: 'Hi! I am your Agri-Clinic AI assistant. Ask me about crop diseases, fertilizers, weather timing, or farm practices.',
        },
      ]);
    } catch (err) {
      console.error('Failed to clear chat history', err);
    }
  };

  return (
    <FarmerLayout
      title="AI Assistant"
      subtitle="Ask questions about crops, diseases, and farm practices"
    >
      <div className="max-w-3xl mx-auto">
        {lastDetection && (
          <div className="mb-4 rounded-2xl border border-agri-200 bg-agri-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-agri-800">
                  Latest scan result
                </div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {lastDetection.detectedDisease} ({lastDetection.confidenceScore}% confidence)
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  I can answer questions about this detection. Or{' '}
                  <Link
                    to="/farmer/disease-detection"
                    className="font-medium text-agri-700 hover:underline"
                  >
                    scan a new image
                  </Link>
                  .
                </div>
              </div>
              <button
                onClick={() => {
                  setLastDetection(null);
                  localStorage.removeItem('ach_lastDetection');
                }}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Chat with AI
              </div>
              <p className="mt-1 text-xs text-slate-600">
                Ask your agricultural questions in simple language.
                {!lastDetection && (
                  <>
                    {' '}
                    Or{' '}
                    <Link
                      to="/farmer/disease-detection"
                      className="font-medium text-agri-700 hover:underline"
                    >
                      scan a crop image
                    </Link>{' '}
                    first for context.
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={clearChat}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear chat
            </button>
          </div>

          <div className="mt-4 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="max-h-[400px] space-y-3 overflow-auto pr-1 text-sm">
               {loadingHistory ? (
                <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
                  Loading previous chats...
                </div>
              ) : null}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.from === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
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
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          <form className="mt-3 flex items-center gap-2" onSubmit={onSubmit}>
            <input
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-agri-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lastDetection
                  ? `Ask about ${lastDetection.detectedDisease} or any farming question...`
                  : 'Type your question here...'
              }
            />
            <button
              type="submit"
              disabled={sending}
              className="rounded-xl bg-agri-700 px-4 py-2 text-sm font-medium text-white hover:bg-agri-800 disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </section>
      </div>
    </FarmerLayout>
  );
}
