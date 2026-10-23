import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Spinner from './components/Spinner';
import MainLayout from './layout/MainLayout';
import Icon from './components/Icons';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import UserForm from './pages/UserForm';
import FamilyDetails from './pages/FamilyDetails';
import DocumentDetails from './pages/DocumentDetails';
import SportsManagement from './pages/SportsManagement';
import TournamentsManagement from './pages/TournamentsManagement';
import TeamsManagement from './pages/TeamsManagement';
import MatchesManagement from './pages/MatchesManagement';
import GalleryManagement from './pages/GalleryManagement';
import EquipmentBookingManagement from './pages/EquipmentBookingManagement';
import GroundBookingManagement from './pages/GroundBookingManagement';
import NoticeBoardManagement from './pages/NoticeBoardManagement';
import FeedbackManagement from './pages/FeedbackManagement';
import HealthFitnessManagement from './pages/HealthFitnessManagement';
import EmergencyContactManagement from './pages/EmergencyContactManagement';
import LiveScoreManagement from './pages/LiveScoreManagement';

// Protected Route Guard (Requires user session)
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

// Admin Dashboard Guard (Guarantees only Admin Login can view the Dashboard)
const AdminDashboardGuard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: '620px', margin: '40px auto', background: '#ffffff', padding: '36px', borderRadius: '16px', border: '1px solid rgba(159, 18, 57, 0.16)', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
          <Icon name="lock" size={28} color="#dc2626" />
        </div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#9f1239', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          RESTRICTED ADMINISTRATIVE PRIVILEGES
        </div>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1a1218', margin: '0 0 10px 0' }}>
          Admin Login Required for Executive Dashboard
        </h2>
        <p style={{ color: '#8a7a8f', fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 24px 0' }}>
          The Executive Operations Dashboard is strictly reserved for Department Administrators and Sports Officers. You are currently logged in as candidate <strong>{user?.name || 'Student Candidate'}</strong>.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/profile')}
            style={{ padding: '10px 18px', borderRadius: '8px', background: '#f5f3ef', border: '1px solid rgba(159, 18, 57, 0.2)', color: '#4b3f52', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer' }}
          >
            ← View My Student Profile
          </button>
          <button
            onClick={() => navigate('/login', { state: { defaultTab: 'admin' } })}
            style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #9f1239 0%, #7b1129 100%)', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Sign In as Administrator</span>
            <Icon name="chevronRight" size={14} />
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

// Public Route Guard (prevents logged in users from visiting login/register)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <Spinner fullPage message="Verifying session..." />;
  }

  if (isAuthenticated) {
    // Admin goes to dashboard, candidates go to their profile
    return <Navigate to={isAdmin ? '/dashboard' : '/profile'} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public/Unauthenticated Routes */}
            <Route path="/" element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            } />
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />

            {/* Protected Routes (Wrapped in MainLayout via ProtectedRoute) */}
            <Route element={<ProtectedRoute />}>
              {/* Dashboard is strictly guarded for Admin Login */}
              <Route path="/dashboard" element={<AdminDashboardGuard />} />

              {/* Administrative and Management Pages */}
              <Route path="/users" element={<UserManagement />} />
              <Route path="/profile" element={<UserForm />} />
              <Route path="/family" element={<FamilyDetails />} />
              <Route path="/documents" element={<DocumentDetails />} />
              <Route path="/sports" element={<SportsManagement />} />
              <Route path="/tournaments" element={<TournamentsManagement />} />
              <Route path="/teams" element={<TeamsManagement />} />
              <Route path="/matches" element={<MatchesManagement />} />
              <Route path="/gallery" element={<GalleryManagement />} />
              <Route path="/equipment-bookings" element={<EquipmentBookingManagement />} />
              <Route path="/ground-bookings" element={<GroundBookingManagement />} />
              <Route path="/notices" element={<NoticeBoardManagement />} />
              <Route path="/feedback" element={<FeedbackManagement />} />
              <Route path="/health-fitness" element={<HealthFitnessManagement />} />
              <Route path="/emergency-contacts" element={<EmergencyContactManagement />} />
              <Route path="/live-scores" element={<LiveScoreManagement />} />
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
