import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut } from 'lucide-react';

function roleHome(role) {
  if (role === 'farmer') return '/farmer/dashboard';
  if (role === 'officer') return '/officer/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/';
}

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:gap-3 sm:px-4">
        <Link to={roleHome(role)} className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-agri-700 to-agri-600 text-sm font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            AC
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              Agri-Clinic Hub
            </div>
            <div className="text-xs font-semibold text-slate-500 capitalize">
              {role || "user"} portal
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-slate-800">
              {user?.name || "Account"}
            </div>
            <div className="text-xs text-slate-500">{user?.email || ""}</div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

