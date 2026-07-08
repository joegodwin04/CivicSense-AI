// src/components/common/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Menu, X, LogIn, LogOut, Shield, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useApp();

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/citizen/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch navbar notifications:', err);
    }
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetchNotifications();
    if (isAuthenticated) {
      const interval = setInterval(fetchNotifications, 12000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group no-underline">
            <div className="w-8 h-8 rounded-full bg-[#E0A030] flex items-center justify-center shrink-0">
              <Shield size={16} className="text-[#0F2A44]" fill="currentColor" />
            </div>
            <div className="font-serif leading-none">
              <span className="font-bold text-white text-lg tracking-wide">CivicSense</span>
              <span className="text-[#E0A030] font-bold text-lg"> AI</span>
            </div>
          </Link>

          {/* Desktop nav */}
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
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#E0A030] text-[#0F2A44] text-sm font-bold hover:bg-[#F0B040] transition-colors no-underline"
                  >
                    <LayoutDashboard size={15} />
                    Admin Platform
                  </Link>
                )}
                {user?.role === 'mp' && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#E0A030] text-[#0F2A44] text-sm font-bold hover:bg-[#F0B040] transition-colors no-underline"
                  >
                    <LayoutDashboard size={15} />
                    MP Dashboard
                  </Link>
                )}
                
                {/* Bell notification button */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="p-2 rounded text-white/60 hover:text-[#E0A030] hover:bg-white/5 transition-all relative cursor-pointer"
                    title="Notifications"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0F2A44]" />
                    )}
                  </button>
                  
                  {/* Dropdown Overlay */}
                  <AnimatePresence>
                    {showNotifDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 mt-2 w-80 bg-[#122438] border border-white/15 rounded-lg shadow-xl overflow-hidden z-50 text-left"
                      >
                        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Latest Alerts</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={async () => {
                                try {
                                  await api.patch('/citizen/notifications/read-all');
                                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                } catch (err) {
                                  console.error('Navbar read all error:', err);
                                }
                              }}
                              className="text-[9px] text-[#E0A030] hover:underline font-bold cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-white/40 text-xs">
                              No recent alerts.
                            </div>
                          ) : (
                            notifications.slice(0, 5).map(n => (
                              <div 
                                key={n._id}
                                className={`p-3 text-xs leading-normal relative hover:bg-white/[0.02] cursor-pointer transition-colors ${
                                  n.read ? 'text-white/50' : 'text-white font-semibold bg-white/[0.01]'
                                }`}
                                onClick={async () => {
                                  setShowNotifDropdown(false);
                                  try {
                                    await api.patch(`/citizen/notifications/${n._id}/read`);
                                    setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, read: true } : item));
                                  } catch (err) {
                                    console.error('Navbar read check error:', err);
                                  }
                                  if (n.request) {
                                    navigate(`/requests/${n.request._id || n.request}`);
                                  }
                                }}
                              >
                                {!n.read && (
                                  <span className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-[#E0A030]" />
                                )}
                                <p className={!n.read ? 'pl-2.5' : ''}>{n.message}</p>
                                <span className={`block mt-1.5 text-[9px] text-white/30 font-bold ${!n.read ? 'pl-2.5' : ''}`}>
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User badge / logout details */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-white/10 ml-1">
                  <div className="w-8 h-8 rounded bg-white/5 border border-white/15 flex items-center justify-center text-xs font-bold text-white uppercase select-none">
                    {user?.name ? user.name.slice(0, 2) : 'US'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded text-white/40 hover:text-red-400 transition-colors cursor-pointer"
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
            className="md:hidden w-9 h-9 flex items-center justify-center rounded bg-[#122438] border border-white/15 text-white/70 hover:text-white transition-all cursor-pointer"
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
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded text-sm font-bold bg-[#E0A030] text-[#0F2A44] no-underline"
                      >
                        <LayoutDashboard size={16} />
                        Admin Platform
                      </Link>
                    )}
                    {user?.role === 'mp' && (
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
                      className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-red-400 hover:bg-white/5 transition-colors text-left cursor-pointer"
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
