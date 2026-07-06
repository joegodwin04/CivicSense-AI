// src/components/dashboard/CategoryChart.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, LabelList
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#ef4444', '#f59e0b', '#10b981', '#f97316'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a]/95 border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-lg">{payload[0].value} <span className="text-xs font-normal text-white/40">requests</span></p>
    </div>
  );
}

export default function CategoryChart({ data = [], loading = false }) {
  if (loading) {
    return (
      <div className="h-64 flex items-end gap-2 px-4 pb-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-white/[0.03] animate-pulse rounded-t-lg shimmer"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3">
        <p className="text-white/20 text-sm">No category data yet</p>
        <p className="text-white/10 text-xs">Citizen requests will populate this chart</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="rgba(255,255,255,0.2)"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontFamily: 'Inter' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.2)"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'Inter' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="requests" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
