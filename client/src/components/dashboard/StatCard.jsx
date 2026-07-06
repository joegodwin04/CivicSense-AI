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
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className={clsx(
        'relative p-5 rounded-2xl border bg-white/[0.025] overflow-hidden group cursor-default',
        'hover:bg-white/[0.04] hover:-translate-y-0.5 transition-all duration-300',
        'hover:shadow-xl',
        c.border,
        c.glow
      )}
    >
      {/* Gradient bleed from top-right corner */}
      <div className={clsx('absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2 bg-gradient-to-br', c.accent, 'to-transparent')} />

      {/* Top row */}
      <div className="flex items-start justify-between mb-5">
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
        <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center ring-1 ring-inset shrink-0', c.bg, c.border)}>
          <Icon size={15} className={c.icon} />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white tracking-tight tabular-nums">{value ?? '—'}</span>
        {delta !== undefined && (
          <span className={clsx('flex items-center gap-0.5 text-xs font-semibold mb-0.5', delta >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>

      {subtitle && <p className="text-white/25 text-[10px] mt-1.5 leading-tight">{subtitle}</p>}
    </motion.div>
  );
}
