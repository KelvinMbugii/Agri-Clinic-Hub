import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff} from "lucide-react";

function roleHome(role) {
  if (role === 'farmer') return '/farmer/dashboard';
  if (role === 'officer') return '/officer/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/';
}

export default function Signup() {
  const { signup, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(roleHome(role), { replace: true });
  }, [isAuthenticated, role, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await signup({ name, email, phone, password, role: selectedRole });
      navigate(roleHome(user?.role), { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Signup failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-earth-700 to-agri-700 p-8 text-white shadow-soft">
          <div className="text-sm font-medium text-white/80">
            Join Agri-Clinic Hub
          </div>
          <h1 className="mt-3 text-2xl font-semibold leading-tight">
            Create your account.
          </h1>
          <p className="mt-3 text-sm text-white/80">
            Farmers get simple tools. Officers get professional workflows
            (verification required).
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Sign up</h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose your role and enter details.
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-sm font-medium text-slate-700">Role</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-agri-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="farmer">Farmer</option>
                <option value="officer">Officer</option>
              </select>
              <div className="mt-2 text-xs text-slate-500">
                Officer accounts may require admin verification before login.
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-agri-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-agri-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-agri-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254..."
                required
              />
            </div>

            <div className="relative">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
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
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>

            <button
              className="inline-flex w-full items-center justify-center rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800 disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              className="font-medium text-agri-700 hover:underline"
              to="/login"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

