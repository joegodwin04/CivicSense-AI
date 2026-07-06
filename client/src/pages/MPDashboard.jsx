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
import { useApp } from '../context/AppContext';

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
    <div className="min-h-screen flex items-center justify-center bg-[#0F2A44]">
      <div className="flex flex-col items-center gap-5">
        <div className="w-12 h-12 rounded bg-[#122438] border border-white/10 flex items-center justify-center">
          <Brain size={22} className="text-[#E0A030]" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-sm font-serif">Loading Intelligence Desk</p>
          <p className="text-[#94A3B8] text-xs mt-1">Retrieving constituency analytics...</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#E0A030]/65 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F2A44] relative text-[#E2E8F0]">
      
      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* === HEADER === */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded bg-[#E0A030] flex items-center justify-center shrink-0">
              <Activity size={19} className="text-[#0F2A44]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-bold text-white tracking-tight font-serif">MP Triage Dashboard</h1>
                <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  Live Sync
                </div>
              </div>
              <p className="text-[#94A3B8] text-xs uppercase font-bold tracking-wider">
                {user?.name ? `${user.name} · ` : ''}District Office: {user?.constituency || 'Bengaluru Central'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#122438] border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded bg-[#122438] border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors">
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>

        {/* === ERROR === */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 px-5 py-4 rounded bg-red-950/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-3"
            >
              <AlertTriangle size={16} className="shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => load()} className="text-xs font-bold underline underline-offset-2 hover:text-red-200 shrink-0">Retry</button>
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
          <div className="col-span-2 p-6 rounded bg-[#122438] border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">Category Distribution</h2>
                <p className="text-[#94A3B8] text-xs mt-0.5">Citizen requests cataloged by theme type</p>
              </div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded">
                Real-time
              </div>
            </div>
            <CategoryChart data={categoryData} loading={false} />
          </div>

          {/* AI Priority card */}
          <div className="col-span-1 p-6 rounded bg-[#122438] border border-[#E0A030]/20 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center gap-2.5 mb-5 border-b border-white/5 pb-3">
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles size={14} className="text-[#E0A030]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white font-serif">AI Top Priority</h2>
                  <p className="text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">Triage Recommendation</p>
                </div>
              </div>

              <div className="relative">
                {topRequest ? (() => {
                  const score = topRequest.priorityScore ?? 0;
                  const isHigh = score >= 90;
                  return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${isHigh ? 'text-red-300 bg-red-950/20 border-red-500/20' : 'text-orange-300 bg-orange-950/20 border-orange-500/20'}`}>
                          <AlertTriangle size={10} />
                          Priority {score}
                        </span>
                        {topRequest.duplicateCount > 0 && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white">
                            +{topRequest.duplicateCount} citizen reports
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white font-serif leading-snug">{topRequest.title}</h3>
                      <p className="text-[#94A3B8] text-xs leading-relaxed line-clamp-3">
                        {topRequest.aiRecommendation || topRequest.description || 'AI analysis pending.'}
                      </p>
                      
                      {topRequest.nearbyInfrastructure?.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] text-[#94A3B8] uppercase tracking-wider font-bold">Proximity Overlays</p>
                          <div className="flex flex-wrap gap-1">
                            {topRequest.nearbyInfrastructure.slice(0, 2).map((infra, idx) => (
                              <span key={idx} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#E0A030]">{infra.split('(')[0].trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-[10px] text-[#94A3B8] flex items-center gap-1.5 pt-1">
                        <MapPin size={10} className="text-[#E0A030]" />
                        <span className="truncate">{topRequest.location?.address || 'Verified location attached'}</span>
                      </div>
                    </div>
                  );
                })() : (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <Brain size={32} className="text-white/10" />
                    <p className="text-[#94A3B8] text-xs font-semibold uppercase tracking-wider">No issues reported</p>
                  </div>
                )}
              </div>
            </div>

            {topRequest && (
              <button className="flex items-center gap-1.5 text-[#E0A030] text-xs font-bold uppercase tracking-wider hover:text-[#F0B040] transition-colors mt-6 border-t border-white/5 pt-3 w-full text-left cursor-pointer">
                <span>View Full Analysis</span>
                <ArrowUpRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* === TAB SWITCHER (Map vs Table) === */}
        <div className="flex items-center gap-1.5 p-1 bg-[#122438] border border-white/10 rounded w-fit mb-6">
          {[
            { id: 'overview', label: 'Requests Table', icon: Shield },
            { id: 'map', label: 'Hotspot Map', icon: MapPin },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === id
                  ? 'bg-[#E0A030] text-[#0F2A44]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 rounded border border-white/10 overflow-hidden relative"
              style={{ height: '460px' }}
            >
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
                <div className="bg-[#122438] border border-white/10 px-4 py-2 rounded flex items-center gap-2 pointer-events-auto shadow-md">
                  <MapPin size={13} className="text-[#E0A030]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Demand Hotspot Map</span>
                </div>
                <div className="bg-[#122438] border border-white/10 px-3 py-2 rounded flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider pointer-events-auto shadow-md">
                  {requests.length} Points Tracked
                </div>
              </div>

              {/* Map legend */}
              <div className="absolute bottom-4 right-4 z-10 bg-[#122438] border border-white/10 px-4 py-3 rounded shadow-md">
                <p className="text-[#94A3B8] text-[9px] font-bold uppercase tracking-widest mb-2">Category Colors</p>
                {[
                  { label: 'Roads', color: '#3b82f6' },
                  { label: 'Water', color: '#06b6d4' },
                  { label: 'Health', color: '#ef4444' },
                  { label: 'Education', color: '#8b5cf6' },
                  { label: 'Electricity', color: '#f59e0b' },
                ].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-2 text-[10px] text-[#E2E8F0] mb-1 font-semibold uppercase tracking-wider">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, opacity: 0.85 }} />
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded bg-[#122438] border border-white/10 overflow-hidden"
            >
              {/* Table toolbar */}
              <div className="px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div>
                  <h2 className="text-base font-bold text-white font-serif">Constituency Incidents Index</h2>
                  <p className="text-[#94A3B8] text-xs mt-0.5">
                    Structured by triage priority score · {filteredRequests.length} rows
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search queue..."
                      className="pl-8 pr-8 py-2 bg-[#0B0F19] border border-white/10 rounded text-white text-xs placeholder-white/30 focus:outline-none focus:border-[#E0A030] transition-all w-44"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  {/* Category filter */}
                  <div className="relative">
                    <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    <select
                      value={filterCategory}
                      onChange={e => setFilterCategory(e.target.value)}
                      className="pl-8 pr-8 py-2 bg-[#0B0F19] border border-white/10 rounded text-white text-xs focus:outline-none focus:border-[#E0A030] transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat} className="capitalize">{cat}</option>
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
