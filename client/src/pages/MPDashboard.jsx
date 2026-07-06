// src/pages/MPDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, MapPin, AlertTriangle, Users,
  ChevronRight, Download, RefreshCw, Sparkles, TrendingUp, Activity
} from 'lucide-react';
import api from '../utils/api';
import MapComponent from '../components/map/MapComponent';
import StatCard from '../components/dashboard/StatCard';
import CategoryChart from '../components/dashboard/CategoryChart';
import RequestsTable from '../components/dashboard/RequestsTable';
import { PageLoader, ErrorState } from '../components/ui/Spinner';

export default function MPDashboard() {
  const [categoryData, setCategoryData] = useState([]);
  const [totals, setTotals] = useState({ totalRequests: 0, unresolved: 0, avgPriority: 0 });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [statsRes, requestsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/requests?limit=10'),
      ]);
      setCategoryData(statsRes.data.data.byCategory || []);
      setTotals(statsRes.data.data.totals || {});
      setRequests(requestsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load dashboard data. Is the API server running?');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const criticalCount = requests.filter((r) => (r.priorityScore ?? 0) > 90).length;

  if (loading) return <div className="p-8"><PageLoader /></div>;

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#060c18]" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-800/6 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-800/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8">
        
        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Activity size={18} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">MP Intelligence Dashboard</h1>
            </div>
            <p className="text-white/35 text-sm ml-12">Live constituency analysis powered by Gemini AI</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/60 text-sm font-medium hover:bg-white/[0.07] hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/60 text-sm font-medium hover:bg-white/[0.07] hover:text-white transition-all">
              <Download size={14} />
              Export PDF
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
              MP
            </div>
          </div>
        </motion.div>

        {/* === ERROR === */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-center gap-3"
          >
            <AlertTriangle size={16} className="shrink-0" />
            {error}
            <button onClick={() => load()} className="ml-auto text-xs underline underline-offset-2 hover:text-red-200">Retry</button>
          </motion.div>
        )}

        {/* === STAT CARDS === */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Requests"
            value={totals.totalRequests?.toLocaleString() ?? '0'}
            icon={Users}
            color="blue"
            index={0}
          />
          <StatCard
            label="Unresolved"
            value={totals.unresolved?.toLocaleString() ?? '0'}
            icon={Brain}
            color="purple"
            index={1}
          />
          <StatCard
            label="Critical (>90)"
            value={criticalCount}
            icon={AlertTriangle}
            color="red"
            index={2}
          />
          <StatCard
            label="Avg Priority"
            value={totals.avgPriority ? Math.round(totals.avgPriority) : '—'}
            icon={TrendingUp}
            color="orange"
            index={3}
          />
        </div>

        {/* === CHART + AI INSIGHT ROW === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Category chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="col-span-2 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-white">Category Distribution</h2>
                <p className="text-white/30 text-xs mt-0.5">Citizen requests by type</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/25">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />
                Live
              </div>
            </div>
            <CategoryChart data={categoryData} loading={false} />
          </motion.div>

          {/* AI Priority card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className="col-span-1 p-6 rounded-2xl bg-gradient-to-br from-blue-900/30 via-violet-900/20 to-blue-900/30 border border-blue-500/20 flex flex-col relative overflow-hidden"
          >
            {/* BG Brain */}
            <div className="absolute -top-4 -right-4 opacity-[0.04]">
              <Brain size={140} />
            </div>
            
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <Sparkles size={13} className="text-violet-400" />
              </div>
              <h2 className="text-base font-semibold text-white">AI Top Priority</h2>
            </div>

            <div className="flex-1 relative z-10">
              {requests.length > 0 ? (
                (() => {
                  const top = requests.sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))[0];
                  const score = top.priorityScore ?? 0;
                  const color = score > 90 ? 'text-red-400 bg-red-500/15 border-red-500/25' : 'text-orange-400 bg-orange-500/15 border-orange-500/25';
                  return (
                    <div>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border mb-3 ${color}`}>
                        <AlertTriangle size={10} />
                        Priority Score: {score}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight">{top.title}</h3>
                      <p className="text-white/45 text-sm leading-relaxed mb-4 line-clamp-3">
                        {top.description || 'AI analysis pending for this request.'}
                      </p>
                      <div className="text-xs text-white/30 flex items-center gap-1.5">
                        <MapPin size={11} />
                        {top.location?.address || 'Location not specified'}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                  <Brain size={36} className="text-white/10" />
                  <p className="text-white/30 text-sm">No data yet</p>
                  <p className="text-white/20 text-xs">AI insights will appear once requests come in</p>
                </div>
              )}
            </div>

            {requests.length > 0 && (
              <button className="flex items-center gap-1.5 text-blue-400 text-sm font-semibold hover:text-blue-300 transition-colors mt-5 relative z-10 group">
                View Full AI Analysis
                <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </motion.div>
        </div>

        {/* === MAP === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-6 rounded-2xl overflow-hidden border border-white/[0.06] relative"
          style={{ height: '420px' }}
        >
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-2">
              <MapPin size={14} className="text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Demand Hotspot Map</h2>
            </div>
            <div className="glass px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs text-white/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              Live Data
            </div>
          </div>
          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-10 glass px-4 py-3 rounded-xl">
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-2">Category</p>
            {[
              { label: 'Roads', color: '#3b82f6' },
              { label: 'Water', color: '#06b6d4' },
              { label: 'Health', color: '#ef4444' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-white/60 mb-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
          <MapComponent />
        </motion.div>

        {/* === REQUESTS TABLE === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Recent High-Priority Requests</h2>
              <p className="text-white/30 text-xs mt-0.5">Sorted by AI priority score</p>
            </div>
            <button className="flex items-center gap-1.5 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors group">
              View All <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <RequestsTable requests={requests} loading={false} />
        </motion.div>

      </div>
    </div>
  );
}
