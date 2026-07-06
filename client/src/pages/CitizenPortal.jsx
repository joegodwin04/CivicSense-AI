// src/pages/CitizenPortal.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Clock, Zap, MapPin, Globe, Mic, Camera, TrendingUp } from 'lucide-react';
import RequestForm from '../components/forms/RequestForm';
import api from '../utils/api';

const benefits = [
  { icon: Sparkles, label: 'AI Analysis', desc: 'Gemini AI reads & categorizes your report in under 2 seconds', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/18' },
  { icon: ShieldCheck, label: 'Anonymous', desc: 'Submit without sharing any personal details — your data stays private', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/18' },
  { icon: Clock, label: 'Real-time', desc: "Your MP's office is notified within seconds of submission", color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/18' },
  { icon: TrendingUp, label: 'Prioritized', desc: 'Your issue is scored and compared with others for urgency', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/18' },
];

const inputModes = [
  { icon: Globe, label: 'Any language' },
  { icon: Camera, label: 'Photo upload' },
  { icon: Mic, label: 'Voice record' },
];

export default function CitizenPortal() {
  const [liveCount, setLiveCount] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setLiveCount(res.data.data?.totals?.totalRequests))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pt-16 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#060c18]" />
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-violet-700/7 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-700/7 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

          {/* === LEFT: Info panel === */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/22 bg-violet-500/8 text-violet-300 text-xs font-semibold mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot flex-shrink-0" />
                Citizen Voice Portal
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
                Your voice shapes
                <br />
                <span className="gradient-text-violet">your constituency.</span>
              </h1>

              <p className="text-white/40 text-base leading-relaxed mb-8">
                Submit civic issues directly to your MP. AI analyzes every report in real-time,
                ensuring the most critical problems are addressed first.
              </p>

              {/* Input mode chips */}
              <div className="flex flex-wrap gap-2 mb-8">
                {inputModes.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/50 text-xs font-medium">
                    <Icon size={12} className="text-white/35" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Benefits grid */}
              <div className="grid grid-cols-2 gap-3">
                {benefits.map(({ icon: Icon, label, desc, color, bg }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className={`p-4 rounded-2xl border ${bg} hover:brightness-110 transition-all`}
                  >
                    <div className={`w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center mb-3 ${color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="text-white font-semibold text-sm mb-1 leading-tight">{label}</div>
                    <div className="text-white/30 text-xs leading-relaxed">{desc}</div>
                  </motion.div>
                ))}
              </div>

              {/* Live counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-7 flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/12"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot flex-shrink-0" />
                <p className="text-emerald-300/80 text-sm">
                  {liveCount !== null ? (
                    <>
                      <span className="font-bold text-emerald-300">{liveCount.toLocaleString()} </span>
                      issues submitted this session
                    </>
                  ) : (
                    <span className="text-emerald-300/50">Live system connected</span>
                  )}
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* === RIGHT: Form === */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Form card */}
            <div className="relative">
              {/* Gradient border glow */}
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-violet-500/20 via-transparent to-blue-500/15 blur-sm" />
              <div className="relative bg-[#0b1221]/80 border border-white/[0.08] rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-7">
                  <div>
                    <h2 className="text-xl font-bold text-white">Report an Issue</h2>
                    <p className="text-white/30 text-xs mt-0.5">All fields are optional except description</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/8 border border-emerald-500/15">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                    Online
                  </div>
                </div>
                <RequestForm />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
