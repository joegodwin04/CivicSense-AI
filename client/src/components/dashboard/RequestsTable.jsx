// src/components/dashboard/RequestsTable.jsx
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpDown } from 'lucide-react';
import { StatusBadge, CategoryBadge } from '../ui/Badge';

function PriorityBar({ score }) {
  const color = score > 90 ? '#ef4444' : score > 70 ? '#f97316' : score > 50 ? '#eab308' : '#3b82f6';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-white/[0.06] rounded-full h-1.5 max-w-[56px] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-white text-xs font-semibold tabular-nums">{score || '—'}</span>
    </div>
  );
}

export default function RequestsTable({ requests = [], loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse shimmer" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
          <ArrowUpDown size={22} className="text-white/20" />
        </div>
        <p className="text-white/30 text-sm">No requests submitted yet.</p>
        <p className="text-white/20 text-xs">They will appear here once citizens start using the portal.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06]">
            {['Issue', 'Category', 'Location', 'Priority', 'Status'].map((col) => (
              <th
                key={col}
                className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-white/30"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requests.map((row, idx) => (
            <motion.tr
              key={row._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group cursor-pointer"
            >
              <td className="px-6 py-4 font-medium text-white max-w-[220px] truncate">
                {row.title}
              </td>
              <td className="px-6 py-4">
                <CategoryBadge category={row.category} />
              </td>
              <td className="px-6 py-4 text-white/50 text-xs">
                {row.location?.address || '—'}
              </td>
              <td className="px-6 py-4">
                <PriorityBar score={row.priorityScore ?? 0} />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={row.status} />
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" />
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
