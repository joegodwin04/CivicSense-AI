// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import CitizenPortal from '../pages/CitizenPortal';
import MPDashboard from '../pages/MPDashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import { useApp } from '../context/AppContext';

// ProtectedRoute checks if the user is authenticated and has the correct role
function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useApp();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/citizen" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />
      <Route
        path="/citizen"
        element={
          <PublicLayout>
            <CitizenPortal />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['mp', 'admin']}>
            <DashboardLayout>
              <MPDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
