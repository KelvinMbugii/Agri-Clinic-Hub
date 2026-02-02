import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff } from "lucide-react";

function roleHome(role) {
  if (role === 'farmer') return '/farmer/dashboard';
  if (role === 'officer') return '/officer/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/';
}

export default function Login() {
  const { login, role: authRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => location.state?.from?.pathname, [location.state]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] =useState(false);

  if (isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="text-lg font-semibold">You’re already signed in.</div>
          <div className="mt-2 text-sm text-slate-600">
            Continue to your dashboard.
          </div>
          <button
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800"
            onClick={() => navigate(roleHome(authRole), { replace: true })}
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, password });
      const nextPath = from || roleHome(user?.role);
      navigate(nextPath, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-agri-700 to-earth-700 p-8 text-white shadow-soft">
          <div className="text-sm font-medium text-white/80">Agri-Clinic Hub</div>
          <h1 className="mt-3 text-2xl font-semibold leading-tight">
            Welcome back.
          </h1>
          <p className="mt-3 text-sm text-white/80">
            Sign in to access AI disease detection, consultations, and expert knowledge.
          </p>
          <div className="mt-8 rounded-xl bg-white/10 p-4 text-sm">
            <div className="font-medium">Tip</div>
            <div className="mt-1 text-white/80">
              Officers may need admin verification before they can log in.
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Login</h2>
          <p className="mt-1 text-sm text-slate-600">Enter your credentials.</p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-0 focus:border-agri-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className = "relative">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none ring-0 focus:border-agri-500"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <span
                className="absolute right-3 bottom-1 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
              </span>
            </div>

            <button
              className="inline-flex w-full items-center justify-center rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            Don’t have an account?{' '}
            <Link className="font-medium text-agri-700 hover:underline" to="/signup">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

