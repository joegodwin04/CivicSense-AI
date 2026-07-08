// src/components/dashboard/RequestsTable.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Users, Sparkles, MapPin, Mic, FileText } from 'lucide-react';
import { getImageUrl } from '../../utils/api';

const CATEGORY_CONFIG = {
  roads:       { label: 'Roads',       color: 'text-blue-300',    bg: 'bg-blue-950/20 border-blue-800/40',    dot: '#3b82f6' },
  water:       { label: 'Water',       color: 'text-cyan-300',    bg: 'bg-cyan-950/20 border-cyan-800/40',    dot: '#06b6d4' },
  health:      { label: 'Health',      color: 'text-red-300',     bg: 'bg-red-950/20 border-red-800/40',      dot: '#ef4444' },
  education:   { label: 'Education',   color: 'text-indigo-300',  bg: 'bg-indigo-950/20 border-indigo-800/40', dot: '#6366f1' },
  electricity: { label: 'Electricity', color: 'text-amber-300',   bg: 'bg-amber-950/20 border-amber-800/40',  dot: '#f59e0b' },
  sanitation:  { label: 'Sanitation',  color: 'text-emerald-300', bg: 'bg-emerald-950/20 border-emerald-800/40', dot: '#10b981' },
  other:       { label: 'Other',       color: 'text-slate-300',   bg: 'bg-slate-900/20 border-slate-700/40',  dot: '#6b7280' },
};

const STATUS_CONFIG = {
  pending:       { label: 'Pending',       cls: 'badge-pending' },
  processing:    { label: 'Processing',    cls: 'badge-processing' },
  'under-review':{ label: 'Under Review',  cls: 'badge-under-review' },
  resolved:      { label: 'Resolved',      cls: 'badge-resolved' },
};

function PriorityScore({ score }) {
  const s = score ?? 0;
  const color = s >= 90 ? '#ef4444' : s >= 70 ? '#f97316' : s >= 50 ? '#eab308' : '#6366f1';
  const label = s >= 90 ? 'Critical' : s >= 70 ? 'High' : s >= 50 ? 'Med' : 'Low';
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 shrink-0">
        <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
          <circle
            cx="18" cy="18" r="15"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeDasharray={`${(s / 100) * 94.2} 94.2`}
            strokeLinecap="square"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-white text-[9px] font-bold">{s}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-[10px]" style={{ color }}>{label}</p>
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
          <div key={i} className="h-14 rounded bg-[#122438] animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded bg-white/5 border border-white/10 flex items-center justify-center">
          <ArrowUpDown size={18} className="text-[#94A3B8]" />
        </div>
        <div className="text-center">
          <p className="text-white text-xs font-bold uppercase tracking-wider">No Incidents Found</p>
          <p className="text-[#94A3B8] text-xs mt-1">Adjust filters or search parameters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {['Issue', 'Category', 'Location', 'Priority', 'Duplicates', 'Status'].map((col) => (
              <th
                key={col}
                className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-widest text-[#94A3B8]"
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
                <tr
                  key={row._id}
                  onClick={() => setExpandedRow(isExpanded ? null : row._id)}
                  className="border-b border-white/10 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5 max-w-[220px]">
                      {row.imageUrl && (
                        <div className="w-8 h-8 rounded overflow-hidden shrink-0 border border-white/15">
                          <img src={getImageUrl(row.imageUrl)} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-white text-[13px] truncate">{row.title}</p>
                        <p className="text-[#94A3B8] text-xs truncate mt-0.5">{row.description?.slice(0, 50)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${catCfg.bg} ${catCfg.color}`}>
                      <div className="w-1 h-1 rounded-full" style={{ background: catCfg.dot }} />
                      {catCfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#94A3B8] text-xs max-w-[140px] truncate">
                    {row.location?.address || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <PriorityScore score={row.priorityScore} />
                  </td>
                  <td className="px-5 py-4">
                    {(row.duplicateCount ?? 0) > 0 ? (
                      <div className="flex items-center gap-1 text-white text-xs">
                        <Users size={12} className="text-[#E0A030]" />
                        <span className="font-bold">+{row.duplicateCount}</span>
                      </div>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${statusCfg.cls}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {statusCfg.label}
                    </span>
                  </td>
                </tr>

                {/* Expanded details */}
                {isExpanded && (
                  <tr className="bg-[#0F2A44]/40 border-b border-white/10">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="flex flex-wrap gap-4 text-xs">
                        {row.aiRecommendation && (
                          <div className="flex-1 min-w-[200px] p-4 rounded bg-[#0F2A44] border border-[#E0A030]/20 space-y-2">
                            <div className="flex items-center gap-1.5">
                              <Sparkles size={13} className="text-[#E0A030]" />
                              <span className="text-white font-bold text-[10px] uppercase tracking-wider">AI Priority Summary</span>
                            </div>
                            <p className="text-[#E2E8F0] leading-relaxed">{row.aiRecommendation}</p>
                          </div>
                        )}
                        {row.nearbyInfrastructure?.length > 0 && (
                          <div className="flex-1 min-w-[160px] p-4 rounded bg-[#0F2A44] border border-white/10 space-y-2">
                            <p className="text-white/50 font-bold text-[10px] uppercase tracking-wider">Proximity Indicators</p>
                            <div className="flex flex-wrap gap-1">
                              {row.nearbyInfrastructure.map((infra, i) => (
                                <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#E0A030]">
                                  {infra}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {row.audioTranscript && (
                          <div className="flex-1 min-w-[160px] p-4 rounded bg-[#0F2A44] border border-white/10 space-y-2">
                            <div className="flex items-center gap-1.5">
                              <Mic size={12} className="text-[#E0A030]" />
                              <p className="text-white/50 font-bold text-[10px] uppercase tracking-wider">Voice Transcript</p>
                            </div>
                            <p className="text-[#E2E8F0] italic">"{row.audioTranscript}"</p>
                          </div>
                        )}
                      </div>
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
