import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { Brain, MapPin, AlertTriangle, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MapComponent from '../components/MapComponent';

const mockData = [
  { name: 'Roads', requests: 400 },
  { name: 'Water', requests: 300 },
  { name: 'Power', requests: 200 },
  { name: 'Health', requests: 278 },
  { name: 'Edu', requests: 189 },
];

export default function MPDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <nav className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-white/50 hover:text-white transition">← Home</Link>
          <h1 className="text-2xl font-bold tracking-tight">MP Dashboard</h1>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition">Download PDF</button>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
            MP
          </div>
        </div>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Requests', value: '1,284', icon: Users, color: 'text-blue-400' },
          { label: 'AI Clustered Issues', value: '42', icon: Brain, color: 'text-purple-400' },
          { label: 'Critical Hotspots', value: '7', icon: MapPin, color: 'text-red-400' },
          { label: 'Avg Sentiment', value: 'Frustrated', icon: AlertTriangle, color: 'text-orange-400' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-white/60 font-medium">{stat.label}</span>
              <stat.icon className={stat.color} size={20} />
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h2 className="text-lg font-semibold mb-6">Category Distribution</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#888" axisLine={false} tickLine={false} />
                <YAxis stroke="#888" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px'}} />
                <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-1 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col"
        >
          <h2 className="text-lg font-semibold mb-4">AI Top Priority</h2>
          <div className="flex-1 bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-xl p-5 mb-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Brain size={100} />
            </div>
            <div className="relative z-10">
              <div className="inline-flex px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded mb-3">Priority Score: 98</div>
              <h3 className="text-xl font-bold mb-2">Road Repair on MG Road</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                "This issue should be the highest priority because 214 citizens reported potholes here, it connects two major schools, and traffic density is critically high."
              </p>
              <button className="flex items-center gap-1 text-blue-400 text-sm font-semibold hover:text-blue-300">
                View Full Analysis <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6 h-[400px] w-full rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative"
      >
        <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
          <h2 className="text-sm font-semibold">Demand Hotspots</h2>
        </div>
        <MapComponent />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent High-Priority Requests</h2>
          <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
            View All <ChevronRight size={16} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-white/50 uppercase bg-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Issue</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Priority Score</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { issue: "Deep potholes causing accidents", cat: "Roads", loc: "Ward 4, MG Road", score: 98, status: "Pending" },
                { issue: "No doctor at Primary Health Center", cat: "Health", loc: "Ward 2, Gandhi Nagar", score: 92, status: "Under Review" },
                { issue: "Contaminated drinking water", cat: "Water", loc: "Ward 7, Lake View", score: 89, status: "Pending" },
                { issue: "Streetlights not working for 2 weeks", cat: "Power", loc: "Ward 1, Main Market", score: 75, status: "Resolved" }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{row.issue}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-white/10 text-white/80 text-xs">{row.cat}</span></td>
                  <td className="px-6 py-4 text-white/70">{row.loc}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-white/10 rounded-full h-1.5 max-w-[60px]">
                        <div className={`h-1.5 rounded-full ${row.score > 90 ? 'bg-red-500' : row.score > 80 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${row.score}%` }}></div>
                      </div>
                      <span className="text-white font-medium">{row.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === 'Resolved' ? 'bg-green-500/20 text-green-400' : row.status === 'Pending' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
