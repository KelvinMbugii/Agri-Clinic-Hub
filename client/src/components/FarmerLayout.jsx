import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Chatbot from './Chatbot.jsx';
import { 
  Home, CloudRain, ScanLine, Bot, CalendarDays, 
  BookOpen, Settings, Menu, X, MessageSquare, Sprout, LogOut
} from 'lucide-react';

const navigation = [
  { to: '/farmer/dashboard', label: 'Home', icon: Home },
  { to: '/farmer/weather', label: 'Weather & Alerts', icon: CloudRain },
  { to: '/farmer/disease-detection', label: 'Disease Detection', icon: ScanLine },
  { to: '/farmer/ai-assistant', label: 'AI Assistant', icon: Bot },
  { to: '/farmer/consultations', label: 'Consultations', icon: CalendarDays },
  { to: '/farmer/articles', label: 'Articles & Guides', icon: BookOpen },
  { to: '/farmer/settings', label: 'Settings', icon: Settings }
];

function NavItems({ onNavigate }) {
  return (
    <nav className="space-y-1.5">
      {navigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-agri-50 text-agri-700 shadow-sm border-l-4 border-agri-600' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={`preset-icon h-5 w-5 ${isActive ? 'text-agri-600' : 'text-slate-400'}`} />
              {item.label}
            </>
          )}
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
          className={`absolute left-0 top-0 h-full w-[85vw] max-w-72 bg-white p-5 shadow-xl transition-transform ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-agri-600 to-agri-500 text-white shadow-md">
                <Sprout className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-semibold">Agri-Clinic Hub</div>
                <div className="text-xs text-slate-500">Farmer navigation</div>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-agri-600 to-agri-500 text-white shadow-md">
                <Sprout className="h-6 w-6" />
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
          <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-lg">
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:hidden hover:bg-slate-50 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <div className="text-base font-semibold text-slate-900 sm:text-lg">{title}</div>
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
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
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
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-agri-600 to-agri-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-agri-600/30 hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
        aria-label="Open AI assistant"
      >
        <MessageSquare className="h-5 w-5 fill-white/20" />
        Ask AI
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
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Close AI assistant"
            >
              <X className="h-5 w-5" />
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
