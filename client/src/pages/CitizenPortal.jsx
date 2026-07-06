// src/pages/CitizenPortal.jsx
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Clock, Zap } from 'lucide-react';
import RequestForm from '../components/forms/RequestForm';

const benefits = [
  { icon: Sparkles, label: 'AI Analysis', desc: 'Gemini AI reads & categorizes your report instantly' },
  { icon: ShieldCheck, label: 'Anonymous', desc: 'Submit without sharing personal details' },
  { icon: Clock, label: 'Real-time', desc: 'MP\'s office notified within seconds' },
  { icon: Zap, label: 'Prioritized', desc: 'Your issue gets scored and ranked automatically' },
];

export default function CitizenPortal() {
  return (
    <div className="min-h-screen pt-16 relative overflow-hidden">
      {/* BG */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#060c18]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-700/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-700/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* === LEFT: Info panel === */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-300 text-xs font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />
                Citizen Voice Portal
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-5">
                Your voice shapes
                <br />
                <span className="gradient-text">your constituency.</span>
              </h1>

              <p className="text-white/45 text-base leading-relaxed mb-10">
                Submit civic issues directly to your MP. AI analyzes every report in real-time,
                ensuring the most critical problems are addressed first.
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3">
                {benefits.map(({ icon: Icon, label, desc }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                      <Icon size={15} className="text-blue-400" />
                    </div>
                    <div className="text-white font-semibold text-sm mb-1">{label}</div>
                    <div className="text-white/35 text-xs leading-relaxed">{desc}</div>
                  </motion.div>
                ))}
              </div>

              {/* Live counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/15"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot" />
                <p className="text-emerald-300/80 text-sm">
                  <span className="font-bold text-emerald-300">1,240+ </span>
                  issues resolved this month in your constituency
                </p>
              </motion.div>
            </motion.div>
          </div>

          {/* === RIGHT: Form === */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/[0.03] border border-white/[0.07] rounded-3xl p-8 backdrop-blur-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-xl font-bold text-white">Report an Issue</h2>
                <p className="text-white/35 text-sm mt-0.5">Fill in the details below</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/30">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                System online
              </div>
            </div>
            <RequestForm />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
