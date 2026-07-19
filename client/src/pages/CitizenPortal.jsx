// src/pages/CitizenPortal.jsx
import { useApp } from '../context/AppContext';
import CitizenDashboard from '../components/dashboard/CitizenDashboard';

export default function CitizenPortal() {
  const { isAuthenticated, user } = useApp();

  return (
    <div className="min-h-screen bg-[#0F2A44] pt-24 pb-12">
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <CitizenDashboard />
      </div>
    </div>
  );
}
