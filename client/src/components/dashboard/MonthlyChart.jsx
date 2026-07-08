import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { CATEGORY_COLORS } from '../../utils/colors';

const LEGEND_ITEMS = [
  { key: 'roads',       label: 'Roads' },
  { key: 'water',       label: 'Water' },
  { key: 'electricity', label: 'Electricity' },
  { key: 'healthcare',  label: 'Healthcare' },
  { key: 'education',   label: 'Education' },
  { key: 'sanitation',  label: 'Sanitation' },
  { key: 'other',       label: 'Other' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum, e) => sum + (e.value || 0), 0);
  const visible = payload.filter(e => e.value > 0);

  return (
    <div
      style={{
        background: 'rgba(13, 22, 38, 0.97)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 8,
        padding: '12px 16px',
        minWidth: 180,
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
    >
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
        {label}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 10 }}>
        {visible.map((entry, idx) => {
          const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.fill, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: 500, textTransform: 'capitalize' }}>{entry.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>{pct}%</span>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>{entry.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
        <span style={{ color: '#E0A030', fontWeight: 800, fontSize: 13 }}>{total}</span>
      </div>
    </div>
  );
}

export default function MonthlyChart({ requests = [], loading = false }) {
  if (loading) {
    return (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin" />
      </div>
    );
  }

  // Build month buckets for last 6 months
  const monthData = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toLocaleString('default', { month: 'short' });
    monthData[monthKey] = { name: monthKey };
    LEGEND_ITEMS.forEach(item => { monthData[monthKey][item.key] = 0; });
  }

  // Populate
  requests.forEach(req => {
    const d = new Date(req.createdAt);
    const month = d.toLocaleString('default', { month: 'short' });
    if (!monthData[month]) return;

    let cat = (req.category || 'other').toLowerCase();
    // Normalise aliases
    if (cat === 'health') cat = 'healthcare';
    if (cat === 'roads & infrastructure' || cat === 'road') cat = 'roads';

    if (monthData[month][cat] !== undefined) {
      monthData[month][cat] += 1;
    } else {
      monthData[month]['other'] += 1;
    }
  });

  const chartData = Object.values(monthData);
  const hasAnyData = chartData.some(d => LEGEND_ITEMS.some(l => d[l.key] > 0));

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginBottom: 16, marginTop: 4 }}>
        {LEGEND_ITEMS.map(item => (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: CATEGORY_COLORS[item.key],
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 220 }}>
        {!hasAnyData ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>No submissions in the last 6 months.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 11 }}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255,255,255,0.03)', rx: 4 }}
              />

              {LEGEND_ITEMS.map((cat, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === LEGEND_ITEMS.length - 1;
                return (
                  <Bar
                    key={cat.key}
                    dataKey={cat.key}
                    name={cat.label}
                    stackId="stack"
                    fill={CATEGORY_COLORS[cat.key]}
                    // Only round the very top of the stack
                    radius={isLast ? [4, 4, 0, 0] : isFirst ? [0, 0, 4, 4] : [0, 0, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
