// src/components/dashboard/StatCard.jsx
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const colorMap = {
  blue:   { ring: 'ring-blue-500/20',   icon: 'text-blue-400',   bg: 'bg-blue-500/10',   glow: 'shadow-blue-500/10' },
  purple: { ring: 'ring-purple-500/20', icon: 'text-purple-400', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/10' },
  red:    { ring: 'ring-red-500/20',    icon: 'text-red-400',    bg: 'bg-red-500/10',    glow: 'shadow-red-500/10' },
  orange: { ring: 'ring-orange-500/20', icon: 'text-orange-400', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/10' },
  emerald:{ ring: 'ring-emerald-500/20',icon: 'text-emerald-400',bg: 'bg-emerald-500/10',glow: 'shadow-emerald-500/10' },
};

export default function StatCard({ label, value, icon: Icon, color = 'blue', delta, index = 0 }) {
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      className={clsx(
        'relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group',
        'shadow-lg',
        c.glow
      )}
    >
      {/* Background glow */}
      <div className={clsx('absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500', c.bg)} />

      <div className="flex items-start justify-between mb-5">
        <span className="text-white/50 text-xs font-semibold uppercase tracking-widest leading-none">{label}</span>
        <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center ring-1', c.bg, c.ring)}>
          <Icon size={16} className={c.icon} />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value ?? '—'}</span>
        {delta !== undefined && (
          <span className={clsx('text-xs font-medium mb-1', delta >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
