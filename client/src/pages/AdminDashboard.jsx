// src/pages/AdminDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  FileText, 
  UserCheck, 
  UserX, 
  Check, 
  X, 
  Search, 
  Trash2, 
  Loader2, 
  ShieldAlert, 
  Activity,
  ChevronRight
} from 'lucide-react';
import api from '../utils/api';
import { useApp } from '../context/AppContext';

export default function AdminDashboard() {
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    citizensCount: 0,
    activeMpsCount: 0,
    pendingMpsCount: 0,
    reportsCount: 0
  });
  const [pendingMps, setPendingMps] = useState([]);
  const [users, setUsers] = useState([]);
  const [userTab, setUserTab] = useState('all'); // all, citizen, mp
  const [searchQuery, setSearchQuery] = useState('');
  
  // Action processing states (to prevent double clicks)
  const [processingId, setProcessingId] = useState(null);

  const fetchStatsAndPending = useCallback(async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data?.success) {
        setStats(response.data.data.stats);
        setPendingMps(response.data.data.pendingMps || []);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to fetch statistics.'
      });
    }
  }, [addNotification]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data?.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    }
  }, []);

  const initData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStatsAndPending(), fetchAllUsers()]);
    setLoading(false);
  }, [fetchStatsAndPending, fetchAllUsers]);

  useEffect(() => {
    initData();
  }, [initData]);

  const handleVerifyMP = async (id, name) => {
    setProcessingId(id);
    try {
      const response = await api.patch(`/admin/verify-mp/${id}`);
      if (response.data?.success) {
        addNotification({
          type: 'success',
          title: 'MP Verified',
          message: `The account for ${name} has been successfully verified.`
        });
        // Refresh data
        await Promise.all([fetchStatsAndPending(), fetchAllUsers()]);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Verification Failed',
        message: error.response?.data?.error || 'Failed to verify MP.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectMP = async (id, name) => {
    if (!window.confirm(`Are you sure you want to REJECT and DELETE the verification request for ${name}?`)) {
      return;
    }
    setProcessingId(id);
    try {
      const response = await api.delete(`/admin/reject-mp/${id}`);
      if (response.data?.success) {
        addNotification({
          type: 'info',
          title: 'Request Rejected',
          message: `The verification request for ${name} has been rejected.`
        });
        await Promise.all([fetchStatsAndPending(), fetchAllUsers()]);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Rejection Failed',
        message: error.response?.data?.error || 'Failed to reject MP.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete the user account for ${name}? This action cannot be undone.`)) {
      return;
    }
    try {
      const response = await api.delete(`/admin/users/${id}`);
      if (response.data?.success) {
        addNotification({
          type: 'success',
          title: 'User Deleted',
          message: `${name}'s account has been successfully deleted.`
        });
        await Promise.all([fetchStatsAndPending(), fetchAllUsers()]);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: error.response?.data?.error || 'Failed to delete user.'
      });
    }
  };

  // Filter users list based on tab and search query
  const filteredUsers = users.filter((u) => {
    const matchesTab = 
      userTab === 'all' || 
      (userTab === 'citizen' && u.role === 'citizen') || 
      (userTab === 'mp' && u.role === 'mp');
      
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.constituency && u.constituency.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F2A44] text-white">
        <Loader2 className="animate-spin text-[#E0A030] mb-4" size={40} />
        <p className="text-[#94A3B8] font-medium tracking-wider uppercase text-xs">Loading Admin Command Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F2A44] text-[#E2E8F0] px-4 py-8 md:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 mt-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[#E0A030] text-xs font-bold uppercase tracking-widest">Administrator Portal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Command Dashboard
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1">
            Oversee civic registration metrics, MP credentials, and reporting operations.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#122438] border border-white/10 px-4 py-2.5 rounded">
          <Activity size={16} className="text-[#E0A030]" />
          <span className="text-xs font-bold text-white tracking-wider uppercase">System Live</span>
        </div>
      </div>

      {/* Grid of 4 Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        
        {/* Total Citizens */}
        <div className="bg-[#122438] border border-white/10 rounded p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none transition-transform group-hover:scale-105"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Registered Citizens</span>
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white">{stats.citizensCount}</h3>
          <p className="text-[#64748B] text-xs mt-1">Platform user accounts</p>
        </div>

        {/* Active MPs */}
        <div className="bg-[#122438] border border-white/10 rounded p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none transition-transform group-hover:scale-105"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Verified MPs</span>
            <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white">{stats.activeMpsCount}</h3>
          <p className="text-[#64748B] text-xs mt-1">Active constituent desks</p>
        </div>

        {/* Pending MPs */}
        <div className="bg-[#122438] border border-white/10 rounded p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none transition-transform group-hover:scale-105"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Pending Approvals</span>
            <div className={`w-8 h-8 rounded flex items-center justify-center ${stats.pendingMpsCount > 0 ? 'bg-amber-500/10 border border-amber-500/20 text-[#E0A030]' : 'bg-white/5 border border-white/10 text-white/40'}`}>
              <ShieldAlert size={16} />
            </div>
          </div>
          <h3 className={`text-3xl font-bold ${stats.pendingMpsCount > 0 ? 'text-[#E0A030]' : 'text-white'}`}>{stats.pendingMpsCount}</h3>
          <p className="text-[#64748B] text-xs mt-1">MP credentials awaiting review</p>
        </div>

        {/* Total Reports */}
        <div className="bg-[#122438] border border-white/10 rounded p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none transition-transform group-hover:scale-105"></div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Civic Issues Filed</span>
            <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileText size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white">{stats.reportsCount}</h3>
          <p className="text-[#64748B] text-xs mt-1">Total citizen reports created</p>
        </div>

      </div>

      {/* Main Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Pending Approvals (5 cols) */}
        <div className="lg:col-span-5 bg-[#122438] border border-white/10 rounded overflow-hidden">
          <div className="border-b border-white/10 p-5 bg-[#162a3f]">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <ShieldAlert className="text-[#E0A030]" size={18} />
              Pending MP Requests
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Verify credentials before granting constituency dashboard access.
            </p>
          </div>

          <div className="p-5">
            <AnimatePresence mode="popLayout">
              {pendingMps.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 px-4 text-center"
                >
                  <UserCheck className="mx-auto text-[#64748B] mb-3" size={32} />
                  <p className="text-[#94A3B8] text-sm font-medium">All requests cleared</p>
                  <p className="text-xs text-[#64748B] mt-1">There are no pending MP credentials to verify.</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {pendingMps.map((mp) => (
                    <motion.div
                      key={mp._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#0B0F19] border border-white/10 rounded p-4 relative"
                    >
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-white text-sm font-bold">{mp.name}</span>
                        <span className="text-xs text-[#94A3B8]">{mp.email}</span>
                        <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2.5">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#64748B] block">Constituency</span>
                            <span className="text-xs font-semibold text-[#E0A030]">{mp.constituency || 'N/A'}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            {/* Reject */}
                            <button
                              onClick={() => handleRejectMP(mp._id, mp.name)}
                              disabled={processingId === mp._id}
                              className="px-2.5 py-1.5 rounded border border-red-500/25 bg-red-950/10 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <X size={13} />
                              Reject
                            </button>
                            
                            {/* Verify */}
                            <button
                              onClick={() => handleVerifyMP(mp._id, mp.name)}
                              disabled={processingId === mp._id}
                              className="px-2.5 py-1.5 rounded border border-emerald-500/25 bg-emerald-950/10 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {processingId === mp._id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Check size={13} />
                              )}
                              Verify
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Directory (7 cols) */}
        <div className="lg:col-span-7 bg-[#122438] border border-white/10 rounded overflow-hidden">
          <div className="border-b border-white/10 p-5 bg-[#162a3f] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Users className="text-[#E0A030]" size={18} />
                User Directory
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                View registered citizens, mps, and manage system accounts.
              </p>
            </div>
            
            {/* Tab selection */}
            <div className="flex bg-[#0B0F19] rounded p-1 border border-white/5 shrink-0 self-start md:self-auto">
              {['all', 'citizen', 'mp'].map((t) => (
                <button
                  key={t}
                  onClick={() => setUserTab(t)}
                  className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                    userTab === t
                      ? 'bg-[#E0A030] text-[#0F2A44]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {/* Search filter */}
            <div className="relative mb-5">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#64748B]">
                <Search size={15} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search directory by name, email, or constituency..."
                className="w-full bg-[#0B0F19] border border-white/10 rounded pl-10 pr-4 py-2 text-white placeholder-white/20 text-xs focus:outline-none focus:border-[#E0A030] transition-colors"
              />
            </div>

            {/* List/Table */}
            <div className="max-h-[500px] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-[#64748B] text-xs">
                  No registered users match the search criteria.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <div 
                      key={u._id} 
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs font-bold">{u.name}</span>
                          
                          {/* Role Badge */}
                          <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider leading-none select-none ${
                            u.role === 'admin' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : u.role === 'mp' 
                                ? 'bg-amber-500/10 text-[#E0A030] border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {u.role}
                          </span>
                          
                          {/* MP Pending Badge */}
                          {u.role === 'mp' && !u.verified && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider leading-none select-none bg-red-500/10 text-red-400 border border-red-500/20">
                              unverified
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#94A3B8] block mt-0.5">{u.email}</span>
                        {u.constituency && (
                          <span className="text-[10px] text-[#64748B] block mt-0.5">
                            Constituency: <strong className="text-white/70 font-semibold">{u.constituency}</strong>
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1.5 rounded border border-white/5 bg-white/5 hover:bg-red-950/20 hover:border-red-500/20 text-[#64748B] hover:text-red-400 transition-all cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
