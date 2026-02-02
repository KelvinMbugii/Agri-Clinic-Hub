import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function roleHome(role) {
  if (role === 'farmer') return '/farmer/dashboard';
  if (role === 'officer') return '/officer/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/';
}

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-3 w-72 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to={roleHome(role)} replace />;
    }
  }

  return <Outlet />;
}

