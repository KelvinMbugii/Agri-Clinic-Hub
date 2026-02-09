import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import NotFound from '../pages/NotFound.jsx';
import FarmerDashboard from '../dashboards/FarmerDashboard.jsx';
import WeatherAlerts from '../pages/farmer/WeatherAlerts.jsx';
import DiseaseDetection from '../pages/farmer/DiseaseDetection.jsx';
import AiAssistant from '../pages/farmer/AiAssistant.jsx';
import Consultations from '../pages/farmer/Consultations.jsx';
import ArticlesGuides from '../pages/farmer/ArticlesGuides.jsx';
import Settings from '../pages/farmer/Settings.jsx';
import OfficerDashboard from '../dashboards/OfficerDashboard.jsx';
import OfficerBookings from '../pages/officer/Bookings.jsx';  
import OfficerConsultations from '../pages/officer/Consultation.jsx';
import OfficerArticles from '../pages/officer/Articles.jsx';
import AdminDashboard from '../dashboards/AdminDashboard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function roleHome(role) {
  if (role === 'farmer') return '/farmer/dashboard';
  if (role === 'officer') return '/officer/dashboard';
  if (role === 'admin') return '/admin/dashboard';
  return '/login';
}

export default function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? roleHome(role) : '/login'} replace />}
      />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Farmer */}
      <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/weather" element={<WeatherAlerts />} />
        <Route path="/farmer/disease-detection" element={<DiseaseDetection />} />
        <Route path="/farmer/ai-assistant" element={<AiAssistant />} />
        <Route path="/farmer/consultations" element={<Consultations />} />
        <Route path="/farmer/articles" element={<ArticlesGuides />} />
        <Route path="/farmer/settings" element={<Settings />} />
      </Route>

      {/* Officer */}
      <Route element={<ProtectedRoute allowedRoles={['officer']} />}>
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/booking" element={<OfficerBookings />} />
        <Route path="/officer/consultation" element={<OfficerConsultations />} />
        <Route path="/officer/articles" element={<OfficerArticles />} />
      
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
