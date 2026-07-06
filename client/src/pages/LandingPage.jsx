// src/pages/LandingPage.jsx
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Sparkles, MapPin, Activity, ShieldCheck,
  Zap, Brain, TrendingUp, Users2, ChevronDown, Mic,
  Camera, GitBranch, Globe, Star, CheckCircle2, BarChart3
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Gemini AI Semantic Engine',
    desc: 'Every citizen report is instantly translated, categorized, and scored by Gemini 2.5 Pro — across 22 Indian languages.',
    color: 'from-violet-600/15 to-blue-600/10',
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    tag: 'AI Core',
    tagColor: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  },
  {
    icon: MapPin,
    title: 'Geospatial Demand Heatmaps',
    desc: 'Google Maps-powered overlays show exactly where citizens need help most, cross-referenced with schools, hospitals, and water points.',
    color: 'from-blue-600/15 to-cyan-600/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    tag: 'Maps',
    tagColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  },
  {
    icon: GitBranch,
    title: 'Smart Deduplication Clusters',
    desc: 'When 15 people report the same pothole, the AI groups them — one entry, priority score 98. No noise, just signal.',
    color: 'from-cyan-600/15 to-teal-600/10',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    tag: 'Clustering',
    tagColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  },
];

const inputModes = [
  { icon: Globe, label: 'Text in any language', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Camera, label: 'Photo of the issue', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
  { icon: Mic, label: 'Voice recording', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
];

const stats = [
  { value: '22', label: 'Languages Supported', icon: Globe, color: 'text-blue-400' },
  { value: '98%', label: 'AI Accuracy', icon: ShieldCheck, color: 'text-emerald-400' },
  { value: '<2s', label: 'Analysis Time', icon: Zap, color: 'text-amber-400' },
  { value: '150m', label: 'Dedup Radius', icon: MapPin, color: 'text-violet-400' },
];

const flow = [
  { n: '01', title: 'Citizen Reports', desc: 'Text, photo, or voice — in any language', color: 'border-blue-500/30 bg-blue-500/5', icon: Users2, iconColor: 'text-blue-400' },
  { n: '02', title: 'Gemini Analyzes', desc: 'Translates, classifies, scores 1–100', color: 'border-violet-500/30 bg-violet-500/5', icon: Brain, iconColor: 'text-violet-400' },
  { n: '03', title: 'AI Clusters', desc: 'Deduplicates and raises priority', color: 'border-cyan-500/30 bg-cyan-500/5', icon: GitBranch, iconColor: 'text-cyan-400' },
  { n: '04', title: 'MP Decides', desc: 'Dashboard shows ranked action items', color: 'border-emerald-500/30 bg-emerald-500/5', icon: BarChart3, iconColor: 'text-emerald-400' },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="relative overflow-hidden" ref={heroRef}>
      {/* === HERO BACKGROUND === */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 gradient-bg-hero" />
        <div className="absolute inset-0 grid-bg opacity-100" />
        {/* Animated nebula blobs */}
        <div className="absolute top-[-15%] left-[-5%] w-[700px] h-[700px] bg-violet-700/12 rounded-full blur-[150px] animate-float" />
        <div className="absolute top-[5%] right-[-10%] w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-[130px] animate-float" style={{ animationDelay: '-3.5s' }} />
        <div className="absolute bottom-[10%] left-[25%] w-[500px] h-[500px] bg-cyan-700/7 rounded-full blur-[110px] animate-float" style={{ animationDelay: '-7s' }} />
      </div>

      {/* === HERO SECTION === */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <motion.div style={{ y, opacity }} className="flex flex-col items-center max-w-5xl mx-auto">

          {/* Announcement pill */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-violet-500/25 bg-violet-500/8 text-violet-300 text-xs font-semibold tracking-wide mb-8 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot flex-shrink-0" />
            Powered by Google Gemini 2.5 Pro
            <Sparkles size={11} className="text-violet-400" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.04] tracking-tighter"
          >
            <span className="text-white">Data-Driven </span>
            <span className="gradient-text-violet">Governance</span>
            <br />
            <span className="text-white/75">for Every Citizen</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-7 text-lg md:text-xl text-white/40 max-w-2xl leading-relaxed"
          >
            Citizens report issues in any language — text, voice, or photo. Gemini AI analyzes,
            clusters, and scores everything in real-time so your MP sees exactly what matters most.
          </motion.p>

          {/* Input mode pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex flex-wrap justify-center gap-2 mt-7"
          >
            {inputModes.map(({ icon: Icon, label, color, bg }) => (
              <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${bg} ${color}`}>
                <Icon size={12} />
                {label}
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/dashboard"
              className="group relative flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-blue-500 transition-all shadow-2xl shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Open MP Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/citizen"
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/[0.09] hover:border-white/[0.18] transition-all backdrop-blur-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <Users2 size={16} />
              <span>Report an Issue</span>
            </Link>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-20 flex flex-col items-center gap-2 text-white/20"
          >
            <span className="text-[10px] tracking-widest uppercase font-medium">Scroll to explore</span>
            <ChevronDown size={15} className="animate-bounce" />
          </motion.div>
        </motion.div>
      </section>

      {/* === MINI DASHBOARD PREVIEW === */}
      <section className="relative z-10 px-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.07] shadow-2xl shadow-black/60">
            {/* Top bar mockup */}
            <div className="bg-[#0b1221] border-b border-white/[0.06] px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-white/[0.04] rounded-lg text-white/30 text-xs font-mono border border-white/[0.05]">
                  civicsense.ai/dashboard
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Live
              </div>
            </div>

            {/* Mock dashboard content */}
            <div className="bg-[#060c18] p-5 grid grid-cols-4 gap-3">
              {[
                { label: 'Total Reports', value: '2,847', color: 'text-blue-400', bg: 'bg-blue-500/8 border-blue-500/15' },
                { label: 'Unresolved', value: '1,203', color: 'text-amber-400', bg: 'bg-amber-500/8 border-amber-500/15' },
                { label: 'Critical (>90)', value: '47', color: 'text-red-400', bg: 'bg-red-500/8 border-red-500/15' },
                { label: 'Avg Priority', value: '71', color: 'text-violet-400', bg: 'bg-violet-500/8 border-violet-500/15' },
              ].map((stat) => (
                <div key={stat.label} className={`p-3 rounded-xl border ${stat.bg}`}>
                  <p className="text-white/30 text-[9px] font-semibold uppercase tracking-wider mb-1.5">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}

              {/* Chart mock */}
              <div className="col-span-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider mb-3">Category Distribution</p>
                <div className="flex items-end gap-2 h-20">
                  {[
                    { h: '75%', c: '#3b82f6', label: 'Roads' },
                    { h: '55%', c: '#8b5cf6', label: 'Water' },
                    { h: '90%', c: '#06b6d4', label: 'Health' },
                    { h: '40%', c: '#f59e0b', label: 'Power' },
                    { h: '60%', c: '#10b981', label: 'Sanit.' },
                    { h: '30%', c: '#6366f1', label: 'Edu' },
                  ].map((bar) => (
                    <div key={bar.label} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full rounded-t-md" style={{ height: bar.h, background: bar.c, opacity: 0.75 }} />
                      <span className="text-white/30 text-[9px]">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI card mock */}
              <div className="col-span-1 p-4 rounded-xl bg-gradient-to-br from-violet-900/25 to-blue-900/20 border border-violet-500/15 flex flex-col">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={11} className="text-violet-400" />
                  <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">AI Priority</span>
                </div>
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/20 text-red-300 text-[9px] font-bold mb-2">
                    Score: 98
                  </div>
                  <p className="text-white/80 text-[11px] font-semibold leading-tight">Open manhole near school crossing</p>
                  <p className="text-white/35 text-[10px] mt-1 leading-relaxed line-clamp-2">Immediate hazard. 19 duplicate reports in 48 hours.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* === STATS BAR === */}
      <section className="relative z-10 py-16 border-y border-white/[0.04] mt-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-2"
              >
                <Icon size={18} className={`${color} opacity-60`} />
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                <div className="text-[11px] text-white/30 font-medium leading-tight">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/40 text-xs font-semibold tracking-wider mb-5">
              <Activity size={11} />
              HOW IT WORKS
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Four steps from complaint
              <br />
              <span className="gradient-text-violet">to decision.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {flow.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative p-6 rounded-2xl border ${step.color} group hover:-translate-y-1.5 transition-all duration-300`}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-3xl font-black text-white/10 font-mono">{step.n}</span>
                  <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center ${step.iconColor}`}>
                    <step.icon size={18} />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 tracking-tight">{step.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{step.desc}</p>

                {/* Arrow to next (except last) */}
                {i < flow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30">
                    <ArrowRight size={10} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="relative z-10 py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] text-white/40 text-xs font-semibold tracking-wider mb-5">
              <Star size={11} />
              CAPABILITIES
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              AI that works for the people
            </h2>
            <p className="mt-4 text-white/35 max-w-xl mx-auto text-base">
              Three core capabilities that transform raw citizen complaints into actionable intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`relative p-7 rounded-3xl bg-gradient-to-br ${feature.color} border ${feature.border} hover:-translate-y-2 transition-all duration-300 group overflow-hidden`}
              >
                <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-current opacity-[0.04] group-hover:opacity-[0.08] transition-opacity blur-2xl" />

                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-2xl ${feature.iconBg} border border-white/10 flex items-center justify-center ${feature.iconColor}`}>
                    <feature.icon size={21} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${feature.tagColor}`}>
                    {feature.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feature.desc}</p>

                <div className="mt-5 flex items-center gap-1.5 text-white/25 text-xs group-hover:text-white/40 transition-colors">
                  <CheckCircle2 size={12} />
                  Production-ready
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA BANNER === */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-14 rounded-3xl bg-gradient-to-br from-violet-900/35 via-blue-900/25 to-violet-900/35 border border-violet-500/18 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 to-blue-600/5 animate-gradient-x" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/30 to-blue-600/20 border border-violet-500/25 flex items-center justify-center mx-auto mb-6">
              <Brain size={26} className="text-violet-300" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Ready to serve smarter?
            </h2>
            <p className="text-white/40 mb-10 max-w-md mx-auto text-base leading-relaxed">
              Join MPs using CivicSense AI to prioritize projects and serve citizens better.
              Demo account ready to explore immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm hover:from-violet-500 hover:to-blue-500 transition-all shadow-xl shadow-violet-500/25 hover:scale-[1.02]"
              >
                <Zap size={16} fill="currentColor" />
                Get Started — Free
              </Link>
              <Link
                to="/citizen"
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/[0.09] transition-all"
              >
                Try Citizen Portal →
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
