// src/pages/MPDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, MapPin, AlertTriangle, Users, ChevronRight, Download,
  RefreshCw, Sparkles, TrendingUp, Activity, Shield, Zap,
  CheckCircle2, Clock, ArrowUpRight, Filter, Search, X
} from 'lucide-react';
import api from '../utils/api';
import MapComponent from '../components/map/MapComponent';
import StatCard from '../components/dashboard/StatCard';
import CategoryChart from '../components/dashboard/CategoryChart';
import RequestsTable from '../components/dashboard/RequestsTable';
import { PageLoader } from '../components/ui/Spinner';
import { useApp } from '../context/AppContext';

const CATEGORY_COLORS = {
  roads: '#3b82f6', water: '#06b6d4', health: '#ef4444',
  education: '#8b5cf6', electricity: '#f59e0b', sanitation: '#10b981', other: '#6366f1',
};

export default function MPDashboard() {
  const [categoryData, setCategoryData] = useState([]);
  const [totals, setTotals] = useState({ totalRequests: 0, unresolved: 0, avgPriority: 0 });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'map'
  const { user } = useApp();

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [statsRes, requestsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/requests?limit=50'),
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
  }, []);

  useEffect(() => { load(); }, [load]);

  const criticalCount = requests.filter((r) => (r.priorityScore ?? 0) >= 90).length;
  const topRequest = [...requests].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))[0];

  const filteredRequests = requests.filter(r => {
    const matchesSearch = !searchQuery || r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [...new Set(requests.map(r => r.category).filter(Boolean))];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#060c18' }}>
      <div className="flex flex-col items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600/30 to-blue-600/20 border border-violet-500/25 flex items-center justify-center animate-pulse">
          <Brain size={22} className="text-violet-300" />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-sm">Loading Intelligence Dashboard</p>
          <p className="text-white/30 text-xs mt-1">Fetching live constituency data...</p>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-violet-500/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#060c18]" />
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-0 left-0 w-[700px] h-[500px] bg-violet-800/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-blue-800/5 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Activity size={19} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-bold text-white tracking-tight">MP Intelligence Dashboard</h1>
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                  Live
                </div>
              </div>
              <p className="text-white/30 text-sm">
                {user?.name ? `Welcome, ${user.name.split(',')[0]} ·` : ''} Constituency: {user?.constituency || 'Bengaluru Central'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/60 text-xs font-semibold hover:bg-white/[0.07] hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-white/60 text-xs font-semibold hover:bg-white/[0.07] hover:text-white transition-all">
              <Download size={13} />
              Export
            </button>
          </div>
        </motion.div>

        {/* === ERROR === */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 px-5 py-4 rounded-2xl bg-red-500/8 border border-red-500/20 text-red-300 text-sm flex items-center gap-3"
            >
              <AlertTriangle size={16} className="shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => load()} className="text-xs font-semibold underline underline-offset-2 hover:text-red-200 shrink-0">Retry</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === STAT CARDS === */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          <StatCard label="Total Reports" value={totals.totalRequests?.toLocaleString() ?? '0'} icon={Users} color="blue" index={0} />
          <StatCard label="Unresolved" value={totals.unresolved?.toLocaleString() ?? '0'} icon={Clock} color="orange" index={1} />
          <StatCard label="Critical (≥90)" value={criticalCount} icon={AlertTriangle} color="red" index={2} />
          <StatCard label="Avg Priority" value={totals.avgPriority ? Math.round(totals.avgPriority) : '—'} icon={TrendingUp} color="purple" index={3} />
        </div>

        {/* === CHART + AI INSIGHT ROW === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Category chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="col-span-2 p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-white/[0.1] transition-colors"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white">Category Distribution</h2>
                <p className="text-white/30 text-xs mt-0.5">Citizen requests by type — all time</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/15">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Real-time
              </div>
            </div>
            <CategoryChart data={categoryData} loading={false} />
          </motion.div>

          {/* AI Priority card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="col-span-1 p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 via-blue-900/20 to-violet-900/30 border border-violet-500/18 flex flex-col relative overflow-hidden"
          >
            {/* decorative brain */}
            <div className="absolute -top-6 -right-6 opacity-[0.04]">
              <Brain size={140} />
            </div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            <div className="flex items-center gap-2.5 mb-5 relative z-10">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                <Sparkles size={14} className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">AI Top Priority</h2>
                <p className="text-white/30 text-[10px]">Highest urgency request</p>
              </div>
            </div>

            <div className="flex-1 relative z-10">
              {topRequest ? (() => {
                const score = topRequest.priorityScore ?? 0;
                const isHigh = score >= 90;
                return (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${isHigh ? 'text-red-400 bg-red-500/12 border-red-500/22' : 'text-orange-400 bg-orange-500/12 border-orange-500/22'}`}>
                        <AlertTriangle size={10} />
                        Priority {score}
                      </span>
                      {topRequest.duplicateCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          +{topRequest.duplicateCount} reports
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mb-2 leading-snug">{topRequest.title}</h3>
                    <p className="text-white/40 text-xs leading-relaxed mb-4 line-clamp-3">
                      {topRequest.aiRecommendation || topRequest.description || 'AI analysis pending.'}
                    </p>
                    {topRequest.nearbyInfrastructure?.length > 0 && (
                      <div className="mb-4">
                        <p className="text-[9px] text-white/25 uppercase tracking-widest font-bold mb-1.5">Nearby Infrastructure</p>
                        <div className="flex flex-wrap gap-1">
                          {topRequest.nearbyInfrastructure.slice(0, 2).map((infra, idx) => (
                            <span key={idx} className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-medium">{infra.split('(')[0].trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-[10px] text-white/25 flex items-center gap-1.5">
                      <MapPin size={10} />
                      {topRequest.location?.address || 'Location not specified'}
                    </div>
                  </div>
                );
              })() : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                  <Brain size={32} className="text-white/10" />
                  <p className="text-white/25 text-sm">No data yet</p>
                </div>
              )}
            </div>

            {topRequest && (
              <button className="flex items-center gap-1.5 text-violet-400 text-xs font-semibold hover:text-violet-300 transition-colors mt-5 relative z-10 group">
                View Full Analysis
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </motion.div>
        </div>

        {/* === TAB SWITCHER (Map vs Table) === */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05] w-fit mb-5">
          {[
            { id: 'overview', label: 'Requests Table', icon: Shield },
            { id: 'map', label: 'Hotspot Map', icon: MapPin },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === id
                  ? 'bg-white/[0.08] text-white shadow-sm'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* === MAP === */}
        <AnimatePresence mode="wait">
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="mb-5 rounded-2xl overflow-hidden border border-white/[0.06] relative"
              style={{ height: '460px' }}
            >
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-2 pointer-events-auto">
                  <MapPin size={13} className="text-violet-400" />
                  <span className="text-sm font-semibold text-white">Demand Hotspot Map</span>
                </div>
                <div className="glass px-3 py-2 rounded-xl flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold pointer-events-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                  {requests.length} Active Points
                </div>
              </div>

              {/* Map legend */}
              <div className="absolute bottom-4 right-4 z-10 glass px-4 py-3 rounded-xl">
                <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest mb-2">Category</p>
                {[
                  { label: 'Roads', color: '#3b82f6' },
                  { label: 'Water', color: '#06b6d4' },
                  { label: 'Health', color: '#ef4444' },
                  { label: 'Education', color: '#8b5cf6' },
                  { label: 'Electricity', color: '#f59e0b' },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-2 text-[10px] text-white/50 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, opacity: 0.8 }} />
                    {label}
                  </div>
                ))}
              </div>
              <MapComponent />
            </motion.div>
          )}

          {/* === REQUESTS TABLE === */}
          {activeTab === 'overview' && (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl bg-white/[0.025] border border-white/[0.06] overflow-hidden"
            >
              {/* Table toolbar */}
              <div className="px-6 py-5 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Recent High-Priority Requests</h2>
                  <p className="text-white/30 text-xs mt-0.5">
                    Sorted by AI priority score · {filteredRequests.length} results
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search requests..."
                      className="pl-8 pr-8 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl text-white/80 text-xs placeholder-white/25 focus:outline-none focus:border-violet-500/40 focus:bg-violet-500/5 transition-all w-44"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {/* Category filter */}
                  <div className="relative">
                    <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="pl-8 pr-4 py-2 bg-white/[0.04] border border-white/[0.07] rounded-xl text-white/80 text-xs focus:outline-none focus:border-violet-500/40 transition-all appearance-none cursor-pointer"
                    >
                      <option value="all" className="bg-[#0b1221]">All Categories</option>
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat} className="bg-[#0b1221] capitalize">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <RequestsTable requests={filteredRequests} loading={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
