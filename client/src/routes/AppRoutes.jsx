// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import CitizenPortal from '../pages/CitizenPortal';
import MPDashboard from '../pages/MPDashboard';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

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
        path="/dashboard"
        element={
          <DashboardLayout>
            <MPDashboard />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}
