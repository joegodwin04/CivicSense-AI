// src/components/ui/Badge.jsx
import { clsx } from 'clsx';

const statusConfig = {
  pending:    { label: 'Pending',    classes: 'badge-pending' },
  processing: { label: 'Processing', classes: 'badge-processing' },
  analyzed:   { label: 'Analyzed',   classes: 'badge-analyzed' },
  resolved:   { label: 'Resolved',   classes: 'badge-resolved' },
};

export function StatusBadge({ status, className }) {
  const config = statusConfig[status] || { label: status, classes: 'badge-pending' };
  return (
    <span className={clsx('badge', config.classes, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

const categoryColors = {
  Roads:       'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  Water:       'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20',
  Health:      'bg-red-500/15 text-red-300 border border-red-500/20',
  Education:   'bg-violet-500/15 text-violet-300 border border-violet-500/20',
  Electricity: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  Sanitation:  'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
};

export function CategoryBadge({ category, className }) {
  return (
    <span className={clsx('badge', categoryColors[category] || 'bg-white/10 text-white/70', className)}>
      {category}
    </span>
  );
}

export function PriorityBadge({ score, className }) {
  const level = score > 90 ? 'Critical' : score > 70 ? 'High' : score > 50 ? 'Medium' : 'Low';
  const colors = {
    Critical: 'bg-red-500/15 text-red-300 border border-red-500/20',
    High:     'bg-orange-500/15 text-orange-300 border border-orange-500/20',
    Medium:   'bg-yellow-500/15 text-yellow-300 border border-yellow-500/20',
    Low:      'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  };
  return (
    <span className={clsx('badge', colors[level], className)}>
      {level} · {score}
    </span>
  );
}
