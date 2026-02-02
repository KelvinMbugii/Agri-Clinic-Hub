import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
          404
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <div className="mt-6">
          <Link
            className="inline-flex items-center justify-center rounded-xl bg-agri-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-agri-800"
            to="/"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

