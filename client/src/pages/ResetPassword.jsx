import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { resetPasswordRequest } from '../services/api.js';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = password.trim();
    const confirmTrimmed = confirmPassword.trim();

    if (trimmed.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (trimmed !== confirmTrimmed) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid reset link. Request a new one from the forgot password page.');
      return;
    }

    setLoading(true);
    try {
      await resetPasswordRequest(token, trimmed);
      navigate('/login', { replace: true, state: { message: 'Password reset successful. You can log in now.' } });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Reset failed. The link may have expired — request a new one.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h1 className="text-xl font-semibold text-slate-900">Invalid link</h1>
          <p className="mt-2 text-sm text-slate-600">
            This reset link is invalid or missing. Please use the forgot password page to request a new link.
          </p>
          <Link
            className="mt-4 inline-flex rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800"
            to="/forgot-password"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-xl font-semibold text-slate-900">Reset password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your new password below (at least 6 characters).
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="relative">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="reset-password"
            >
              New password
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
          <div className="relative">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="reset-confirm"
            >
              Confirm password
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none ring-0 focus:border-agri-500"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800 disabled:opacity-60"
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm text-slate-600">
          <Link
            className="font-medium text-agri-700 hover:underline"
            to="/login"
          >
            Back to login
          </Link>
          <Link
            className="font-medium text-agri-700 hover:underline"
            to="/forgot-password"
          >
            New reset link
          </Link>
        </div>
      </div>
    </div>
  );
}
