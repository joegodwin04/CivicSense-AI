import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { motion } from 'framer-motion';
import { STATUS_COLORS } from '../../utils/colors';

const STATUS_LABELS = {
  pending:       'Pending',
  processing:    'Processing',
  'under-review':'In Progress',
  resolved:      'Resolved',
  rejected:      'Rejected',
};

const STATUS_ORDER = ['pending', 'processing', 'under-review', 'resolved', 'rejected'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div style={{
      background: 'rgba(13,22,38,0.97)',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 8,
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      minWidth: 140,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[item.key] || '#6b7280', display: 'inline-block' }} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {STATUS_LABELS[item.key] || item.key}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>{item.value}</span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{item.pct}%</span>
      </div>
    </div>
  );
}

export default function StatusChart({ data = {}, loading = false }) {
  if (loading) {
    return (
      <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
      </div>
    );
  }

  const total = data.total || 0;

  const chartData = STATUS_ORDER
    .map(key => ({ key, value: data[key] || 0 }))
    .filter(d => d.value > 0)
    .map(d => ({ ...d, pct: total > 0 ? Math.round((d.value / total) * 100) : 0 }));

  const renderCenterLabel = ({ viewBox }) => {
    const { cx, cy } = viewBox;
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan x={cx} y={cy - 6} fill="#ffffff" fontSize="26" fontWeight="800" fontFamily="Georgia, serif">
          {total}
        </tspan>
        <tspan x={cx} y={cy + 16} fill="rgba(255,255,255,0.35)" fontSize="9" fontWeight="700" letterSpacing="0.08em">
          TOTAL
        </tspan>
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Donut Chart */}
      {chartData.length === 0 ? (
        <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>No data yet.</p>
        </div>
      ) : (
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={54}
                outerRadius={76}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
                isAnimationActive
                animationDuration={900}
                animationEasing="ease-out"
                labelLine={false}
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={STATUS_COLORS[entry.key] || '#6b7280'}
                    style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.4))', cursor: 'pointer' }}
                  />
                ))}
                <Label content={renderCenterLabel} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STATUS_ORDER.map(key => {
          const value = data[key] || 0;
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          const color = STATUS_COLORS[key] || '#6b7280';
          const label = STATUS_LABELS[key] || key;
          const barWidth = total > 0 ? (value / total) * 100 : 0;

          return (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Dot */}
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
              {/* Label */}
              <span style={{ color: 'rgba(255,255,255,0.60)', fontSize: 11, fontWeight: 600, width: 82, flexShrink: 0 }}>{label}</span>
              {/* Progress bar */}
              <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={{ height: '100%', background: color, borderRadius: 2 }}
                />
              </div>
              {/* Count + % */}
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 12, width: 20, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {value}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, width: 28, textAlign: 'right', flexShrink: 0 }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
