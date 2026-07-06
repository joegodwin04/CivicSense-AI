// src/components/dashboard/CategoryChart.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, LabelList
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#ef4444', '#f59e0b', '#10b981', '#f97316'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0b1221]/97 border border-white/10 rounded-2xl px-4 py-3.5 shadow-2xl backdrop-blur-xl">
      <p className="text-white/40 text-[11px] font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-bold text-xl tabular-nums">
        {payload[0].value}
        <span className="text-[11px] font-normal text-white/35 ml-1.5">requests</span>
      </p>
    </div>
  );
}

function CustomBar(props) {
  const { x, y, width, height, fill } = props;
  if (!height || height <= 0) return null;
  return (
    <g>
      <rect
        x={x} y={y} width={width} height={height}
        fill={fill} fillOpacity={0.7}
        rx={6} ry={6}
      />
      {/* Top glow */}
      <rect
        x={x} y={y} width={width} height={Math.min(4, height)}
        fill={fill} fillOpacity={0.95}
        rx={6} ry={6}
      />
    </g>
  );
}

export default function CategoryChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="h-64 flex items-end gap-3 px-4 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-white/[0.03] rounded-t-xl shimmer"
            style={{ height: `${25 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
          <span className="text-xl">📊</span>
        </div>
        <p className="text-white/20 text-sm">No category data yet</p>
        <p className="text-white/10 text-xs">Submit citizen requests to populate this chart</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.requests || 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 4, left: -24, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.0)"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', fontFamily: 'Inter', fontWeight: 500 }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.0)"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontFamily: 'Inter' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.025)', radius: 6 }} />
          <Bar dataKey="requests" shape={<CustomBar />} maxBarSize={44} radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
