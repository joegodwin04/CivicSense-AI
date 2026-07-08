// src/pages/MPDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, MapPin, AlertTriangle, Users, ChevronRight, Download,
  RefreshCw, Sparkles, TrendingUp, Activity, Shield, Zap,
  CheckCircle2, Clock, ArrowUpRight, Filter, Search, X, Layers
} from 'lucide-react';
import api from '../utils/api';
import MapComponent from '../components/map/MapComponent';
import StatCard from '../components/dashboard/StatCard';
import CategoryChart from '../components/dashboard/CategoryChart';
import StatusChart from '../components/dashboard/StatusChart';
import MonthlyChart from '../components/dashboard/MonthlyChart';
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'map' | 'analytics' | 'ai'
  const { user, addNotification } = useApp();

  // AI Insights Desk states
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [statsRes, requestsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/requests?limit=100'),
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

  const loadAIInsights = useCallback(async () => {
    setAiLoading(true);
    try {
      const res = await api.get('/dashboard/ai-insights');
      setAiInsights(res.data.data);
    } catch (err) {
      console.error('Failed to load AI Insights:', err);
      addNotification({
        type: 'error',
        title: 'AI Analysis Failed',
        message: 'Could not generate constituency-wide summaries.'
      });
    } finally {
      setAiLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (activeTab === 'ai' && !aiInsights) {
      loadAIInsights();
    }
  }, [activeTab, aiInsights, loadAIInsights]);

  const criticalCount = requests.filter((r) => (r.priorityScore ?? 0) >= 90).length;
  const topRequest = [...requests].sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))[0];

  const filteredRequests = requests.filter(r => {
    const matchesSearch = !searchQuery || r.title?.toLowerCase().includes(searchQuery.toLowerCase()) || r.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = [...new Set(requests.map(r => r.category).filter(Boolean))];

  const handleExportCSV = () => {
    if (requests.length === 0) {
      addNotification({ type: 'warning', title: 'Export Failed', message: 'No request records to export.' });
      return;
    }
    const headers = ['Title', 'Description', 'Category', 'Status', 'Priority Score', 'Duplicates', 'Address', 'Latitude', 'Longitude', 'Created At'];
    const rows = requests.map(r => [
      `"${r.title?.replace(/"/g, '""') || ''}"`,
      `"${r.description?.replace(/"/g, '""') || ''}"`,
      r.category || '',
      r.status || '',
      r.priorityScore || 0,
      r.duplicateCount || 0,
      `"${r.location?.address?.replace(/"/g, '""') || ''}"`,
      r.location?.coordinates?.[1] || '',
      r.location?.coordinates?.[0] || '',
      new Date(r.createdAt).toISOString()
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `constituency_grievances_${user?.constituency?.replace(/\s+/g, '_') || 'reports'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification({ type: 'success', title: 'Export Successful', message: 'Constituency records downloaded in CSV format.' });
  };

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
    <div className="min-h-screen bg-[#0F2A44] relative text-[#E2E8F0] py-8">
      
      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 mt-16">

        {/* === HEADER === */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4 text-left">
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
              onClick={() => {
                load(true);
                if (activeTab === 'ai') loadAIInsights();
              }}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#122438] border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded bg-[#122438] border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-colors cursor-pointer"
            >
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

        {/* === TAB SWITCHER === */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#122438] border border-white/10 rounded w-fit mb-6">
          {[
            { id: 'overview', label: 'Requests Queue', icon: Shield },
            { id: 'map', label: 'Hotspot Map', icon: MapPin },
            { id: 'analytics', label: 'Analytics & Trends', icon: Activity },
            { id: 'ai', label: 'AI Intelligence Desk', icon: Sparkles }
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

        {/* === TAB CONTENT === */}
        <AnimatePresence mode="wait">
          
          {/* Map View */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 rounded border border-white/10 overflow-hidden relative"
              style={{ height: '560px' }}
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
              <div className="absolute bottom-4 right-4 z-10 bg-[#122438] border border-white/10 px-4 py-3 rounded shadow-md text-left">
                <p className="text-[#94A3B8] text-[9px] font-bold uppercase tracking-widest mb-2">Category Colors</p>
                {[
                  { label: 'Roads', color: '#3b82f6' },
                  { label: 'Water', color: '#06b6d4' },
                  { label: 'Health', color: '#ef4444' },
                  { label: 'Education', color: '#8b5cf6' },
                  { label: 'Electricity', color: '#f59e0b' },
                  { label: 'Sanitation', color: '#10b981' }
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

          {/* Requests Queue Table */}
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
                <div className="text-left">
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

          {/* Analytics & Trends View */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left"
            >
              {/* Category Breakdown */}
              <div className="p-6 rounded bg-[#122438] border border-white/10">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif mb-4">Category Distribution</h2>
                <CategoryChart data={categoryData} loading={false} />
              </div>

              {/* Status Breakdown */}
              <div className="p-6 rounded bg-[#122438] border border-white/10">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif mb-4">Status Distribution</h2>
                <StatusChart data={totals} loading={false} />
              </div>

              {/* Monthly Submission Trend */}
              <div className="col-span-1 lg:col-span-2 p-6 rounded bg-[#122438] border border-white/10">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif mb-4">Monthly Submissions</h2>
                <MonthlyChart requests={requests} loading={false} />
              </div>
            </motion.div>
          )}

          {/* AI Insights Desk View */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 text-left"
            >
              {aiLoading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-10 h-10 border-2 border-white/10 border-t-[#E0A030] rounded-full animate-spin" />
                  <p className="text-xs uppercase tracking-wider text-[#94A3B8] font-bold">Synthesizing Constituency AI Insights...</p>
                </div>
              ) : aiInsights ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Summary and actions (8 cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    {/* Summary */}
                    <div className="p-6 rounded bg-[#122438] border border-[#E0A030]/20 space-y-3">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                        <Sparkles size={16} className="text-[#E0A030]" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-serif">AI Constituency Summary</h3>
                      </div>
                      <p className="text-[#E2E8F0] text-sm leading-relaxed">
                        {aiInsights.constituencySummary}
                      </p>
                    </div>

                    {/* Action plans */}
                    <div className="p-6 rounded bg-[#122438] border border-white/10 space-y-4">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                        <Zap size={16} className="text-[#E0A030]" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-serif">Recommended Priority Actions</h3>
                      </div>
                      <ul className="space-y-2">
                        {aiInsights.recommendedActions?.map((action, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-[#0F2A44] p-3 border border-white/5 rounded text-xs text-white/80 leading-relaxed">
                            <span className="w-5 h-5 rounded-full bg-[#E0A030]/10 border border-[#E0A030]/20 text-[#E0A030] font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Government Schemes */}
                    <div className="p-6 rounded bg-[#122438] border border-white/10 space-y-4">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                        <Layers size={16} className="text-[#E0A030]" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-serif">Suggested Government Schemes</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {aiInsights.suggestedSchemes?.map((scheme, idx) => (
                          <div key={idx} className="p-4 rounded bg-[#0F2A44] border border-white/5 space-y-2">
                            <h4 className="text-white font-bold text-xs font-serif leading-snug">{scheme.name}</h4>
                            <p className="text-white/60 text-[11px] leading-relaxed">{scheme.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hotspots and priority review (4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Hotspot card */}
                    <div className="p-6 rounded bg-[#122438] border border-white/10 space-y-3">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-white/5">
                        <MapPin size={16} className="text-[#E0A030]" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-serif">hotspot analysis</h3>
                      </div>
                      <p className="text-[#E2E8F0] text-xs leading-relaxed">
                        {aiInsights.heatAnalysis}
                      </p>
                    </div>

                    {/* AI Top priority shortcut */}
                    {topRequest && (
                      <div className="p-6 rounded bg-[#122438] border border-[#E0A030]/20 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/5">
                            <Sparkles size={14} className="text-[#E0A030]" />
                            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">Top Urgent Grievance</span>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-red-400 bg-red-950/20 border border-red-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                            Priority Score: {topRequest.priorityScore}
                          </span>
                          <h4 className="text-sm font-bold text-white font-serif leading-snug">{topRequest.title}</h4>
                          <p className="text-white/60 text-xs line-clamp-3 leading-relaxed">
                            {topRequest.aiRecommendation || topRequest.description}
                          </p>
                        </div>
                        <Link 
                          to={`/requests/${topRequest._id}`}
                          className="flex items-center gap-1.5 text-[#E0A030] text-xs font-bold uppercase tracking-wider hover:text-[#F0B040] transition-colors border-t border-white/5 pt-3 w-full text-left cursor-pointer no-underline"
                        >
                          <span>Open Full Analysis</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="p-12 text-center text-white/40 text-sm">
                  AI insights could not be compiled. Adjust metrics and refresh.
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
