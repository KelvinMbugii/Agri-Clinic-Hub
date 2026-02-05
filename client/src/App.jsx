import AppRoutes from './routes/AppRoutes.jsx';
import Navbar from './components/Navbar.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { isAuthenticated, role } = useAuth();
  const showNavbar = isAuthenticated && role !== 'farmer';

  return (
    <div className="min-h-dvh bg-gradient-to-b from-amber-50 to-white">
      {showNavbar ? <Navbar /> : null}
      <AppRoutes />
    </div>
  );
}
