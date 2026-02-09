import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to={roleHome(role)} className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-agri-700 text-sm font-semibold text-white">
            AC
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">Agri-Clinic Hub</div>
            <div className="text-xs text-slate-500 capitalize">{role || 'user'} portal</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-slate-800">{user?.name || 'Account'}</div>
            <div className="text-xs text-slate-500">{user?.email || ''}</div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

