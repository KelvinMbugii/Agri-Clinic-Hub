import AppRoutes from './routes/AppRoutes.jsx';
import Navbar from './components/Navbar.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-amber-50 to-white">
      {isAuthenticated ? <Navbar /> : null}
      <AppRoutes />
    </div>
  );
}

