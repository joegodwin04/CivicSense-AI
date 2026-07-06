// src/components/dashboard/StatCard.jsx
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

const colorMap = {
  blue:    { icon: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/15',    glow: 'hover:shadow-blue-500/10',    accent: 'from-blue-500/10' },
  purple:  { icon: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/15',  glow: 'hover:shadow-purple-500/10',  accent: 'from-purple-500/10' },
  violet:  { icon: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/15',  glow: 'hover:shadow-violet-500/10',  accent: 'from-violet-500/10' },
  red:     { icon: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/15',     glow: 'hover:shadow-red-500/10',     accent: 'from-red-500/10' },
  orange:  { icon: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/15',  glow: 'hover:shadow-orange-500/10',  accent: 'from-orange-500/10' },
  emerald: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/15', glow: 'hover:shadow-emerald-500/10', accent: 'from-emerald-500/10' },
  cyan:    { icon: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/15',    glow: 'hover:shadow-cyan-500/10',    accent: 'from-cyan-500/10' },
};

export default function StatCard({ label, value, icon: Icon, color = 'blue', delta, index = 0, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative p-5 bg-[#122438] border border-white/10 rounded transition-all duration-200 group hover:border-[#E0A030]"
    >
      {/* Top gold accent line visible only on hover */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-[#E0A030] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
        <div className="w-8 h-8 rounded bg-white/5 border border-white/15 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-[#E0A030]" />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight font-serif">{value ?? '—'}</span>
        {delta !== undefined && (
          <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded', delta >= 0 ? 'bg-emerald-950/20 text-emerald-300' : 'bg-red-950/20 text-red-300')}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>

      {subtitle && <p className="text-white/30 text-[10px] mt-1.5 leading-tight">{subtitle}</p>}
    </motion.div>
  );
}
