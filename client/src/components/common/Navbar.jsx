// src/components/common/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LayoutDashboard, Users, Menu, X, LogIn, LogOut } from 'lucide-react';
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
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#070d1a]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl shadow-black/40'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm leading-none">CivicSense</span>
              <span className="text-blue-400 font-bold text-sm"> AI</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              to="/citizen"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
            >
              <Users size={15} />
              Citizen Portal
            </Link>

            {isAuthenticated ? (
              <>
                {(user?.role === 'mp' || user?.role === 'admin') && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                  >
                    <LayoutDashboard size={15} />
                    MP Dashboard
                  </Link>
                )}
                
                {/* User avatar / logout details */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-semibold text-white uppercase select-none">
                    {user?.name ? user.name.slice(0, 2) : 'US'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/70 hover:text-white hover:bg-white/[0.07] text-sm font-semibold transition-all"
              >
                <LogIn size={15} />
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0a1020]/95 backdrop-blur-2xl border-b border-white/[0.06] overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <Link
                  to="/citizen"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
                >
                  <Users size={16} />
                  Citizen Portal
                </Link>

                {isAuthenticated ? (
                  <>
                    {(user?.role === 'mp' || user?.role === 'admin') && (
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600/20 to-violet-600/20 text-blue-300 border border-blue-500/20"
                      >
                        <LayoutDashboard size={16} />
                        MP Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all text-left"
                    >
                      <LogOut size={16} />
                      Log Out ({user?.name})
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-violet-600 text-white"
                  >
                    <LogIn size={16} />
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
