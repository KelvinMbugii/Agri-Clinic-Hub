import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Home, CalendarDays, MessageSquare, 
  FileText, Settings, Users, Database
} from 'lucide-react';

const linksByRole = {
  farmer: [{ to: '/farmer/dashboard', label: 'Dashboard', icon: Home }],
  officer: [
      { to: '/officer/dashboard', label: 'Dashboard', icon: Home },
      { to: '/officer/booking', label: 'Booking Management', icon: CalendarDays },
      { to: '/officer/consultation', label: 'Consultation Management', icon: MessageSquare },
      { to: '/officer/articles', label: 'Articles Management', icon: FileText },
      { to: '/officer/settings', label: 'Settings', icon: Settings },
      ],
  admin: [{ to: '/admin/dashboard', label: 'Dashboard', icon: Home },
      { to: '/admin/officers', label: 'Officers Management', icon: Users },
      { to: '/admin/articles', label: 'Articles Management', icon: FileText },
      { to: '/admin/ai-pipeline', label: 'AI Knowledge', icon: Database },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
      ],
};

export default function Sidebar() {
  const { role } = useAuth();
  const links = linksByRole[role] || [];

  return (
    <>
      <div className="mb-4 overflow-x-auto lg:hidden">
        <nav className="flex w-max min-w-full gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="p-4">
          <div className="rounded-2xl bg-agri-50 p-4">
            <div className="text-xs font-medium text-agri-800">Navigation</div>
            <div className="mt-1 text-sm text-slate-700 capitalize">{role || 'user'}</div>
          </div>

          <nav className="mt-4 space-y-1.5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent hover:border-agri-600"
              >
                <l.icon className="h-5 w-5 text-slate-400 group-hover:text-agri-600 transition-colors" />
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
  </>
  );
}

