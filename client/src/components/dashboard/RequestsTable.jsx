// src/components/dashboard/RequestsTable.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ExternalLink, Users, Sparkles } from 'lucide-react';

const CATEGORY_CONFIG = {
  roads:       { label: 'Roads',       color: 'text-blue-300',    bg: 'bg-blue-500/10 border-blue-500/20',    dot: '#3b82f6' },
  water:       { label: 'Water',       color: 'text-cyan-300',    bg: 'bg-cyan-500/10 border-cyan-500/20',    dot: '#06b6d4' },
  health:      { label: 'Health',      color: 'text-red-300',     bg: 'bg-red-500/10 border-red-500/20',      dot: '#ef4444' },
  education:   { label: 'Education',   color: 'text-violet-300',  bg: 'bg-violet-500/10 border-violet-500/20', dot: '#8b5cf6' },
  electricity: { label: 'Electricity', color: 'text-amber-300',   bg: 'bg-amber-500/10 border-amber-500/20',  dot: '#f59e0b' },
  sanitation:  { label: 'Sanitation',  color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20', dot: '#10b981' },
  other:       { label: 'Other',       color: 'text-slate-300',   bg: 'bg-slate-500/10 border-slate-500/20',  dot: '#6b7280' },
};

const STATUS_CONFIG = {
  pending:       { label: 'Pending',       cls: 'badge-pending' },
  processing:    { label: 'Processing',    cls: 'badge-processing' },
  'under-review':{ label: 'Under Review',  cls: 'badge-under-review' },
  analyzed:      { label: 'Analyzed',      cls: 'badge-analyzed' },
  resolved:      { label: 'Resolved',      cls: 'badge-resolved' },
};

function PriorityScore({ score }) {
  const s = score ?? 0;
  const color = s >= 90 ? '#ef4444' : s >= 70 ? '#f97316' : s >= 50 ? '#eab308' : '#6366f1';
  const label = s >= 90 ? 'Critical' : s >= 70 ? 'High' : s >= 50 ? 'Med' : 'Low';
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-9 h-9 shrink-0">
        <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${(s / 100) * 94.2} 94.2`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-bold">{s}</span>
      </div>
      <div>
        <p className="text-white/70 text-[10px] font-semibold" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

export default function RequestsTable({ requests = [], loading = false }) {
  const [expandedRow, setExpandedRow] = useState(null);

  if (loading) {
    return (
      <div className="space-y-2 p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-white/[0.025] shimmer" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
          <ArrowUpDown size={22} className="text-white/15" />
        </div>
        <div className="text-center">
          <p className="text-white/25 text-sm font-medium">No requests found</p>
          <p className="text-white/15 text-xs mt-1">Try adjusting your search or filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.05]">
            {['Issue', 'Category', 'Location', 'Priority', 'Duplicates', 'Status'].map((col) => (
              <th
                key={col}
                className="px-5 py-3.5 text-left text-[9px] font-bold uppercase tracking-widest text-white/25"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requests.map((row, idx) => {
            const catCfg = CATEGORY_CONFIG[row.category?.toLowerCase()] || CATEGORY_CONFIG.other;
            const statusCfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedRow === row._id;

            return (
              <>
                <motion.tr
                  key={row._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setExpandedRow(isExpanded ? null : row._id)}
                  className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5 max-w-[220px]">
                      {row.imageUrl && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                          <img src={row.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-[13px] truncate">{row.title}</p>
                        <p className="text-white/30 text-[10px] truncate mt-0.5">{row.description?.slice(0, 50)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${catCfg.bg} ${catCfg.color}`}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: catCfg.dot }} />
                      {catCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-xs max-w-[140px] truncate">
                    {row.location?.address || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <PriorityScore score={row.priorityScore} />
                  </td>
                  <td className="px-5 py-4">
                    {(row.duplicateCount ?? 0) > 0 ? (
                      <div className="flex items-center gap-1.5 text-blue-300 text-xs">
                        <Users size={12} />
                        <span className="font-bold">+{row.duplicateCount}</span>
                      </div>
                    ) : (
                      <span className="text-white/15 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${statusCfg.cls}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusCfg.label}
                    </span>
                  </td>
                </motion.tr>

                {/* Expanded AI Row */}
                {isExpanded && (
                  <tr className="border-b border-white/[0.04]">
                    <td colSpan={6} className="px-5 py-4 bg-white/[0.015]">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-wrap gap-4 text-xs"
                      >
                        {row.aiRecommendation && (
                          <div className="flex-1 min-w-[200px] p-3 rounded-xl bg-violet-500/8 border border-violet-500/15">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Sparkles size={11} className="text-violet-400" />
                              <span className="text-violet-300 font-bold text-[10px] uppercase tracking-wider">AI Recommendation</span>
                            </div>
                            <p className="text-white/60 leading-relaxed">{row.aiRecommendation}</p>
                          </div>
                        )}
                        {row.nearbyInfrastructure?.length > 0 && (
                          <div className="flex-1 min-w-[160px] p-3 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                            <p className="text-white/30 font-bold text-[10px] uppercase tracking-wider mb-1.5">Nearby Infrastructure</p>
                            <div className="flex flex-wrap gap-1">
                              {row.nearbyInfrastructure.map((infra, i) => (
                                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/8 border border-violet-500/15 text-violet-300">
                                  {infra}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {row.audioTranscript && (
                          <div className="flex-1 min-w-[160px] p-3 rounded-xl bg-white/[0.025] border border-white/[0.06]">
                            <p className="text-white/30 font-bold text-[10px] uppercase tracking-wider mb-1.5">Voice Transcript</p>
                            <p className="text-white/50 leading-relaxed italic">"{row.audioTranscript}"</p>
                          </div>
                        )}
                      </motion.div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
