// src/components/common/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Menu, X, LogIn, LogOut, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useApp();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0F2A44] border-b border-white/10 shadow-md'
            : 'bg-[#0F2A44]/95 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo - Serif Display pairing */}
          <Link to="/" className="flex items-center gap-2.5 group no-underline">
            <div className="w-8 h-8 rounded-full bg-[#E0A030] flex items-center justify-center shrink-0">
              <Shield size={16} className="text-[#0F2A44]" fill="currentColor" />
            </div>
            <div className="font-serif leading-none">
              <span className="font-bold text-white text-lg tracking-wide">CivicSense</span>
              <span className="text-[#E0A030] font-bold text-lg"> AI</span>
            </div>
          </Link>

          {/* Desktop nav - No generic blur gradients */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              to="/citizen"
              className="flex items-center gap-2 px-3 py-2 rounded text-white hover:text-[#E0A030] text-sm font-medium transition-colors no-underline"
            >
              <Users size={15} />
              Citizen Portal
            </Link>

            {isAuthenticated ? (
              <>
                {(user?.role === 'mp' || user?.role === 'admin') && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#E0A030] text-[#0F2A44] text-sm font-bold hover:bg-[#F0B040] transition-colors no-underline"
                  >
                    <LayoutDashboard size={15} />
                    MP Dashboard
                  </Link>
                )}
                
                {/* User badge / logout details */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
                  <div className="w-8 h-8 rounded bg-white/5 border border-white/15 flex items-center justify-center text-xs font-bold text-white uppercase select-none">
                    {user?.name ? user.name.slice(0, 2) : 'US'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded text-white/40 hover:text-red-400 transition-colors"
                    title="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded bg-[#122438] border border-white/10 text-white hover:bg-white/5 text-sm font-bold transition-colors no-underline"
              >
                <LogIn size={15} />
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded bg-[#122438] border border-white/15 text-white/70 hover:text-white transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <div className="md:hidden bg-[#0F2A44] border-b border-white/10 overflow-hidden">
              <div className="px-4 py-4 space-y-2.5">
                <Link
                  to="/citizen"
                  className="flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-white hover:text-[#E0A030] hover:bg-white/5 no-underline"
                >
                  <Users size={16} />
                  Citizen Portal
                </Link>

                {isAuthenticated ? (
                  <>
                    {(user?.role === 'mp' || user?.role === 'admin') && (
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded text-sm font-bold bg-[#E0A030] text-[#0F2A44] no-underline"
                      >
                        <LayoutDashboard size={16} />
                        MP Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-red-400 hover:bg-white/5 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      Log Out ({user?.name})
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-3 rounded text-sm font-bold bg-[#E0A030] text-[#0F2A44] no-underline"
                  >
                    <LogIn size={16} />
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
