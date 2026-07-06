// src/pages/CitizenPortal.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Clock, Zap, MapPin, Globe, Mic, Camera, TrendingUp } from 'lucide-react';
import RequestForm from '../components/forms/RequestForm';
import api from '../utils/api';

const benefits = [
  { icon: Sparkles, label: 'AI Triage Analysis', desc: 'Gemini AI structures your report and extracts key details instantly', color: 'text-[#E0A030]', bg: 'bg-[#122438] border-white/10' },
  { icon: ShieldCheck, label: 'Verified Anonymity', desc: 'File reports securely. No mandatory registration or tracking.', color: 'text-[#E0A030]', bg: 'bg-[#122438] border-white/10' },
  { icon: Clock, label: 'Real-time Routing', desc: "Your representative's prioritization queue updates automatically.", color: 'text-[#E0A030]', bg: 'bg-[#122438] border-white/10' },
  { icon: TrendingUp, label: 'Priority Indexing', desc: 'Calculates urgency using localized demographic overlays.', color: 'text-[#E0A030]', bg: 'bg-[#122438] border-white/10' },
];

const inputModes = [
  { icon: Globe, label: '22 Languages' },
  { icon: Camera, label: 'Photo Upload' },
  { icon: Mic, label: 'Voice Record' },
];

export default function CitizenPortal() {
  const [liveCount, setLiveCount] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setLiveCount(res.data.data?.totals?.totalRequests))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0F2A44] pt-16 relative">
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* === LEFT: Info panel === */}
          <div className="lg:sticky lg:top-24 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E0A030]" />
                Citizen Reporting Hub
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight font-serif">
                Your report shapes <br />
                <span className="text-[#E0A030]">constituency action.</span>
              </h1>

              <p className="text-[#E2E8F0] text-base leading-relaxed">
                Submit local infrastructure issues directly to your Member of Parliament's triage desk. All content is analyzed by translation algorithms and cross-referenced with public infrastructure data.
              </p>

              {/* Input mode chips */}
              <div className="flex flex-wrap gap-2">
                {inputModes.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white/70 text-xs font-semibold uppercase tracking-wider">
                    <Icon size={12} className="text-[#E0A030]" />
                    {label}
                  </div>
                ))}
              </div>

              {/* Benefits list (flat cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map(({ icon: Icon, label, desc, color, bg }, i) => (
                  <div
                    key={label}
                    className={`p-4 rounded border ${bg} space-y-2`}
                  >
                    <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${color}`}>
                      <Icon size={15} />
                    </div>
                    <h3 className="text-white font-bold text-sm tracking-wide">{label}</h3>
                    <p className="text-white/60 text-xs leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>

              {/* High Contrast live counter (no pulse glows) */}
              <div className="p-4 rounded bg-[#122438] border border-[#E0A030]/20 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                  {liveCount !== null ? (
                    <>
                      <span className="text-[#E0A030] font-bold">{liveCount.toLocaleString()} </span>
                      active reports tracked in database
                    </>
                  ) : (
                    <span>System Online & Connected</span>
                  )}
                </p>
              </div>

            </motion.div>
          </div>

          {/* === RIGHT: Form === */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {/* Flat Card Frame */}
            <div className="bg-[#122438] border border-white/10 rounded p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white font-serif">Report Public Issue</h2>
                  <p className="text-white/50 text-xs mt-1">Fields are optional unless specified</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Secure Link
                </div>
              </div>
              
              <RequestForm />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
