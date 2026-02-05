import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Chatbot from './Chatbot.jsx';

const navigation = [
  { to: '/farmer/dashboard', label: 'Home' },
  { to: '/farmer/weather', label: 'Weather & Alerts' },
  { to: '/farmer/disease-detection', label: 'Disease Detection' },
  { to: '/farmer/ai-assistant', label: 'AI Assistant' },
  { to: '/farmer/consultations', label: 'Consultations' },
  { to: '/farmer/articles', label: 'Articles & Guides' },
  { to: '/farmer/settings', label: 'Settings' }
];

function NavItems({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block rounded-xl px-3 py-2 text-sm font-medium transition ${
              isActive ? 'bg-agri-700 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function FarmerLayout({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-amber-50/60 text-slate-900">
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          isMenuOpen ? '' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMenuOpen(false)}
          role="presentation"
        />
        <aside
          className={`absolute left-0 top-0 h-full w-72 bg-white p-5 shadow-xl transition-transform ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-agri-700 text-sm font-semibold text-white">
                AC
              </div>
              <div>
                <div className="text-sm font-semibold">Agri-Clinic Hub</div>
                <div className="text-xs text-slate-500">Farmer navigation</div>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600"
            >
              Close
            </button>
          </div>
          <div className="mt-5">
            <NavItems onNavigate={() => setIsMenuOpen(false)} />
          </div>
        </aside>
      </div>

      <div className="flex">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="flex h-full flex-col gap-6 p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-agri-700 text-sm font-semibold text-white">
                AC
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Agri-Clinic Hub</div>
                <div className="text-xs text-slate-500">Farmer workspace</div>
              </div>
            </div>

            <div className="rounded-2xl bg-agri-50 p-4">
              <div className="text-xs font-medium text-agri-800">Hello</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {user?.name || 'Farmer'}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                Weather-aware guidance and support
              </div>
            </div>

            <NavItems />
          </div>
        </aside>

        <div className="flex min-h-dvh flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
                  aria-label="Open menu"
                >
                  ☰
                </button>
                <div>
                  <div className="text-lg font-semibold text-slate-900">{title}</div>
                  {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-medium text-slate-800">{user?.name || 'Account'}</div>
                  <div className="text-xs text-slate-500">{user?.email || 'Farmer'}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-agri-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-agri-700/30 hover:bg-agri-800"
        aria-label="Open AI assistant"
      >
        💬 Ask AI
      </button>

      <div
        className={`fixed inset-0 z-40 ${
          isChatOpen ? '' : 'pointer-events-none'
        }`}
      >
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity ${
            isChatOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsChatOpen(false)}
          role="presentation"
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white p-5 shadow-xl transition-transform ${
            isChatOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">AI Assistant</div>
              <div className="text-xs text-slate-500">
                Context-aware help for farmers
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-agri-50 px-3 py-1">Weather: 24°C, humid</span>
            <span className="rounded-full bg-amber-50 px-3 py-1">Disease scans: 1 today</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Saved guides: 3</span>
          </div>

          <div className="mt-4">
            <Chatbot />
          </div>
        </aside>
      </div>
    </div>
  );
}
