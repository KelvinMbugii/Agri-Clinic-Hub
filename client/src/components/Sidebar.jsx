import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linksByRole = {
  farmer: [{ to: '/farmer/dashboard', label: 'Dashboard' }],
  officer: [{ to: '/officer/dashboard', label: 'Dashboard' }],
  admin: [{ to: '/admin/dashboard', label: 'Dashboard' }]
};

export default function Sidebar() {
  const { role } = useAuth();
  const links = linksByRole[role] || [];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="p-4">
        <div className="rounded-2xl bg-agri-50 p-4">
          <div className="text-xs font-medium text-agri-800">Navigation</div>
          <div className="mt-1 text-sm text-slate-700 capitalize">{role || 'user'}</div>
        </div>

        <nav className="mt-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

