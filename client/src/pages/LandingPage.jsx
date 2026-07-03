import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Activity, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[1000px] h-[1000px] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <nav className="glass fixed top-4 inset-x-4 md:inset-x-auto md:w-[600px] md:left-1/2 md:-translate-x-1/2 z-50 rounded-full px-6 py-4 flex items-center justify-between">
        <div className="font-semibold tracking-tight">AI-DSS</div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link to="/citizen" className="text-white/70 hover:text-white transition-colors">Citizen Portal</Link>
          <Link to="/dashboard" className="bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition">MP Login</Link>
        </div>
      </nav>

      <main className="pt-40 px-6 max-w-5xl mx-auto relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Powered by Google Gemini AI
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
        >
          Data-Driven Decisions for <br /> Future-Ready Constituencies.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl"
        >
          An intelligent system that consolidates citizen feedback, maps demand hotspots, and ranks development priorities using demographic AI.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link to="/dashboard" className="flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform">
            View MP Dashboard
            <ArrowRight size={18} />
          </Link>
          <Link to="/citizen" className="flex items-center justify-center gap-2 bg-white/10 border border-white/10 px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-colors">
            Submit Request
          </Link>
        </motion.div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {[
            { title: "Semantic Clustering", desc: "Groups similar complaints intelligently using Gemini.", icon: Activity },
            { title: "Hotspot Detection", desc: "Visualizes demand intensity on interactive maps.", icon: MapPin },
            { title: "Smart Prioritization", desc: "Ranks projects by combining requests with infrastructure data.", icon: ShieldCheck }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
              className="p-6 rounded-3xl border border-white/10 bg-white/5 glass"
            >
              <feature.icon className="text-blue-400 mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
