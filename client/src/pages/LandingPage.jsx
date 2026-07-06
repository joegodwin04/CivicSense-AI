// src/pages/LandingPage.jsx
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Sparkles, MapPin, Activity, ShieldCheck,
  Zap, Brain, TrendingUp, Users2, ChevronDown
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Semantic AI Clustering',
    desc: 'Gemini AI groups thousands of citizen reports by theme, location, and urgency — eliminating duplicate noise.',
    color: 'from-blue-600/20 to-blue-400/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    glow: 'shadow-blue-500/10',
  },
  {
    icon: MapPin,
    title: 'Demand Hotspot Maps',
    desc: 'Interactive heatmaps that visualize where citizens need help the most, overlaid with infrastructure data.',
    color: 'from-violet-600/20 to-violet-400/10',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    glow: 'shadow-violet-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Smart Prioritization',
    desc: 'AI-generated priority scores rank projects by combining citizen volume, demographics, and infrastructure gaps.',
    color: 'from-cyan-600/20 to-cyan-400/10',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
    glow: 'shadow-cyan-500/10',
  },
];

const stats = [
  { value: '10K+', label: 'Requests Analyzed', icon: Activity },
  { value: '98%', label: 'Accuracy Rate', icon: ShieldCheck },
  { value: '50+', label: 'Constituencies', icon: MapPin },
  { value: '3x', label: 'Faster Decisions', icon: Zap },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="relative overflow-hidden" ref={heroRef}>
      {/* === HERO BACKGROUND === */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040812] via-[#060c18] to-[#040812]" />
        {/* Nebula blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-700/15 rounded-full blur-[140px] animate-float" />
        <div className="absolute top-[10%] right-[-15%] w-[600px] h-[600px] bg-violet-700/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        <div className="absolute bottom-[5%] left-[20%] w-[500px] h-[500px] bg-cyan-700/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-6s' }} />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* === HERO SECTION === */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <motion.div style={{ y, opacity }} className="flex flex-col items-center">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-300 text-xs font-semibold tracking-wide mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />
            Powered by Google Gemini AI
            <Sparkles size={12} className="text-blue-400" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tighter max-w-5xl"
          >
            <span className="text-white">Data-Driven </span>
            <span className="gradient-text">Governance</span>
            <br />
            <span className="text-white/80">for Every Citizen</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-7 text-lg md:text-xl text-white/45 max-w-2xl leading-relaxed"
          >
            An intelligent platform that consolidates citizen feedback, maps demand hotspots,
            and ranks development priorities using AI — empowering MPs to act faster and smarter.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/dashboard"
              className="group relative flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm hover:from-blue-500 hover:to-violet-500 transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Open MP Dashboard</span>
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/citizen"
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/[0.08] hover:border-white/[0.18] transition-all backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Users2 size={17} />
              <span>Report an Issue</span>
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-20 flex flex-col items-center gap-2 text-white/20"
          >
            <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
            <ChevronDown size={16} className="animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* === STATS BAR === */}
      <section className="relative z-10 py-12 border-y border-white/[0.05] bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <Icon size={20} className="text-blue-400/60 mb-3" />
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                <div className="text-xs text-white/35 mt-1 font-medium">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs font-semibold tracking-wider mb-6">
              <Activity size={11} />
              CAPABILITIES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              AI that works for the people
            </h2>
            <p className="mt-4 text-white/40 max-w-xl mx-auto text-base">
              Three core capabilities that transform raw citizen complaints into actionable intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative p-7 rounded-3xl bg-gradient-to-br ${feature.color} border ${feature.border} shadow-xl ${feature.glow} hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden`}
              >
                {/* Corner glow */}
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-current opacity-5 group-hover:opacity-10 transition-opacity blur-2xl" />
                <div className={`w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 ${feature.iconColor}`}>
                  <feature.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA BANNER === */}
      <section className="relative z-10 py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-blue-900/40 via-violet-900/30 to-blue-900/40 border border-blue-500/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-violet-600/5 animate-gradient-x" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to make data-driven decisions?
            </h2>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Join hundreds of MPs using CivicSense AI to prioritize projects and serve citizens better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#060c18] font-bold text-sm hover:bg-white/90 transition-all shadow-xl shadow-white/10 hover:scale-[1.02]"
              >
                <Zap size={16} fill="currentColor" />
                Get Started Free
              </Link>
              <Link
                to="/citizen"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all"
              >
                Citizen Portal →
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
