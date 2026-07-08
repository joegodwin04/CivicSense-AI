// src/components/dashboard/CitizenDashboard.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, LayoutList, 
  FileText, Clock, PlayCircle, CheckCircle2, XCircle, AlertTriangle, Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';

import StatCard from './StatCard';
import RequestsTable from './RequestsTable';
import StatusChart from './StatusChart';
import MonthlyChart from './MonthlyChart';
import RequestForm from '../forms/RequestForm';

export default function CitizenDashboard() {
  const { user } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, 'under-review': 0, resolved: 0, rejected: 0 });
  const [requests, setRequests] = useState([]);
  
  // View toggle: 'dashboard' | 'new_complaint' | 'all_requests'
  const [view, setView] = useState('dashboard');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [statsRes, reqsRes] = await Promise.all([
        api.get('/citizen/my-stats'),
        api.get('/citizen/my-requests')
      ]);
      setStats(statsRes.data.data);
      setRequests(reqsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to sync dashboard intelligence. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const inProgressCount = (stats.processing || 0) + (stats['under-review'] || 0);
  const pendingCount = stats.pending || 0;
  const resolvedCount = stats.resolved || 0;
  const rejectedCount = stats.rejected || 0;

  // Whether any of the "secondary" stats have data
  const hasSecondaryStats = inProgressCount > 0 || resolvedCount > 0 || rejectedCount > 0;

  if (view === 'new_complaint') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-serif">Submit New Report</h2>
          <button 
            onClick={() => { setView('dashboard'); loadData(true); }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-sm font-bold border border-white/10 transition-colors"
          >
            Cancel
          </button>
        </div>
        <div className="bg-[#122438] border border-white/10 rounded p-8">
          <RequestForm onSuccess={() => {
            setView('dashboard');
            loadData(true);
          }} />
        </div>
      </div>
    );
  }

  if (view === 'all_requests') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white font-serif">All My Requests</h2>
          <button 
            onClick={() => setView('dashboard')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded text-sm font-bold border border-white/10 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
        <RequestsTable requests={requests} loading={loading} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white font-serif">Welcome back, {user?.name || 'Citizen'}</h1>
          <p className="text-[#94A3B8] text-sm mt-1">Here's an overview of your civic requests.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setView('new_complaint')}
            className="flex items-center gap-2 px-4 py-2 bg-[#E0A030] hover:bg-[#F0B040] text-[#0F2A44] font-bold text-sm rounded shadow-[0_0_15px_rgba(224,160,48,0.3)] transition-all"
          >
            <PlusCircle size={16} />
            New Complaint
          </button>
          
          <button 
            onClick={() => setView('all_requests')}
            className="flex items-center gap-2 px-4 py-2 bg-[#122438] hover:bg-white/5 border border-white/10 text-white font-bold text-sm rounded transition-all"
          >
            <LayoutList size={16} />
            All Requests
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="px-5 py-4 rounded bg-red-950/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-3"
          >
            <AlertTriangle size={16} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => loadData()} className="text-xs font-bold underline underline-offset-2 hover:text-red-200">Retry</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Statistics Cards */}
      <div className="flex flex-wrap items-stretch gap-4">
        {/* Always show Total */}
        <div className="flex-1 min-w-[140px]">
          <StatCard label="Total Requests" value={stats.total} icon={FileText} color="blue" index={0} />
        </div>
        {/* Always show Pending */}
        <div className="flex-1 min-w-[140px]">
          <StatCard label="Pending" value={pendingCount} icon={Clock} color="orange" index={1} />
        </div>

        {/* Expanded individual cards when values exist */}
        {inProgressCount > 0 && (
          <div className="flex-1 min-w-[140px]">
            <StatCard label="In Progress" value={inProgressCount} icon={PlayCircle} color="purple" index={2} />
          </div>
        )}
        {resolvedCount > 0 && (
          <div className="flex-1 min-w-[140px]">
            <StatCard label="Resolved" value={resolvedCount} icon={CheckCircle2} color="emerald" index={3} />
          </div>
        )}
        {rejectedCount > 0 && (
          <div className="flex-1 min-w-[140px]">
            <StatCard label="Rejected" value={rejectedCount} icon={XCircle} color="red" index={4} />
          </div>
        )}

        {/* Compact "Other Status" card when all secondary stats are 0 */}
        {!hasSecondaryStats && stats.total > 0 && (
          <div className="flex-1 min-w-[180px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="relative p-5 bg-[#122438] border border-white/10 rounded h-full"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">Other Status</span>
                <div className="w-8 h-8 rounded bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
                  <Layers size={14} className="text-[#E0A030]" />
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'In Progress', value: inProgressCount, color: 'text-purple-400' },
                  { label: 'Resolved',    value: resolvedCount,   color: 'text-emerald-400' },
                  { label: 'Rejected',    value: rejectedCount,   color: 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-white/40 text-[10px] uppercase tracking-wider">{label}</span>
                    <span className={`text-sm font-bold tabular-nums ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* 3. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="col-span-1 bg-[#122438] border border-white/10 rounded p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif mb-6">Status Distribution</h2>
          <StatusChart data={stats} loading={loading} />
        </div>

        {/* Monthly Requests */}
        <div className="col-span-1 lg:col-span-2 bg-[#122438] border border-white/10 rounded p-6 flex flex-col">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif mb-2">Monthly Submissions</h2>
          <MonthlyChart requests={requests} loading={loading} />
        </div>
      </div>

      {/* 4. Recent Requests */}
      <div className="bg-[#122438] border border-white/10 rounded overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white font-serif">Recent Requests</h2>
            <p className="text-[#94A3B8] text-xs mt-0.5">Your latest reports and their statuses</p>
          </div>
          {view === 'dashboard' && requests.length > 5 && (
            <button 
              onClick={() => setView('all_requests')}
              className="text-xs font-bold text-[#E0A030] hover:text-white transition-colors uppercase tracking-wider"
            >
              View All
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-sm">
            You haven't submitted any civic requests yet.
          </div>
        ) : (
          <RequestsTable 
            requests={view === 'dashboard' ? requests.slice(0, 5) : requests} 
            loading={loading} 
          />
        )}
      </div>

    </div>
  );
}
