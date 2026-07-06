// src/pages/LandingPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, MapPin, ShieldCheck,
  Users2, Globe, CheckCircle2, Languages, Star, GraduationCap, Heart, HelpCircle
} from 'lucide-react';
import MapComponent from '../components/map/MapComponent';

const translationExamples = [
  { lang: 'Hindi', native: 'सड़क पर बड़े गड्ढे हैं और दुर्घटनाएं हो रही हैं।', english: 'There are large potholes on the road and accidents are happening.' },
  { lang: 'Kannada', native: 'ಕುಡಿಯುವ ನೀರಿನ ಕೊಳವೆ ಒಡೆದು ನೀರು ವ್ಯರ್ಥವಾಗುತ್ತಿದೆ.', english: 'The drinking water pipe has burst and water is being wasted.' },
  { lang: 'Tamil', native: 'தெரு விளக்குகள் எரியாததால் பெண்கள் நடப்பது பாதுகாப்பற்றதாக உள்ளது.', english: 'Since streetlights are not working, walking is unsafe for women.' },
  { lang: 'Telugu', native: 'గత ఐదు రోజులుగా మా వీధిలో మున్సిపల్ నీటి సరఫరా లేదు.', english: 'There has been no municipal water supply in our street for the last five days.' }
];

export default function LandingPage() {
  const [selectedLang, setSelectedLang] = useState(0);

  return (
    <div className="min-h-screen bg-[#0F2A44] text-[#E2E8F0] pt-24 pb-16 px-6 relative">
      
      {/* Strict high-contrast layout, generous whitespace, no decorative blurs/gradients */}
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Section Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Left Column: Heading, Callouts, Translation Showcase */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-8"
          >
            
            {/* Flat circular/square Badge indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E0A030]" />
              National Constituency Support System
            </div>

            {/* Display Serif Headings (Fraunces) */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight font-serif">
              Constituency decisions <br />
              <span className="text-[#E0A030]">driven by citizen voice.</span>
            </h1>

            {/* High-contrast body text */}
            <p className="text-[#E2E8F0] text-base md:text-lg leading-relaxed max-w-xl">
              An official intelligence platform for parliamentary decision support. Citizens report civic issues in local languages. Google Gemini AI translates, clusters duplicate reports, and maps hotspots instantly.
            </p>

            {/* CTAs using Solid Navy & Amber styling */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded bg-[#E0A030] hover:bg-[#F0B040] text-[#0F2A44] font-bold text-sm transition-colors shadow-sm no-underline"
              >
                <span>MP Representative Sign In</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/citizen"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded bg-[#122438] hover:bg-white/5 border border-white/10 text-white font-bold text-sm transition-colors no-underline"
              >
                <Users2 size={16} />
                <span>File Citizen Report</span>
              </Link>
            </div>

            {/* Multilingual AI Translation Panel Card - Flat & Proper padding */}
            <div className="p-6 rounded bg-[#122438] border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Languages size={15} className="text-[#E0A030]" />
                  Multilingual AI Translation Panel
                </span>
                <span className="text-white/50 text-[11px] font-semibold">Real-Time Synthesis</span>
              </div>

              {/* Language Selector pills */}
              <div className="flex flex-wrap gap-2">
                {translationExamples.map((item, idx) => (
                  <button
                    key={item.lang}
                    onClick={() => setSelectedLang(idx)}
                    className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors cursor-pointer ${
                      selectedLang === idx
                        ? 'bg-[#E0A030] border-[#E0A030] text-[#0F2A44]'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {item.lang}
                  </button>
                ))}
              </div>

              {/* Translation grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 rounded bg-[#0F2A44] border border-white/5 space-y-2">
                  <p className="text-white/40 font-bold uppercase text-[9px] tracking-wider">Citizen Voice Input</p>
                  <p className="text-white font-medium italic leading-relaxed">"{translationExamples[selectedLang].native}"</p>
                </div>
                <div className="p-4 rounded bg-[#0F2A44] border border-[#E0A030]/20 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-white/40 font-bold uppercase text-[9px] tracking-wider flex items-center gap-1">
                      <Sparkles size={9} className="text-[#E0A030]" />
                      AI Translated English
                    </p>
                    <p className="text-[#E2E8F0] font-medium leading-relaxed">"{translationExamples[selectedLang].english}"</p>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 select-none">
                    <CheckCircle2 size={12} />
                    Verified Auto-translation
                  </div>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Framed Hotspot Map Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-6 space-y-6"
          >
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 select-none">
                <MapPin size={14} className="text-[#E0A030]" />
                Constituency Hotspot Index Map
              </span>
              <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Live Preview</span>
            </div>

            {/* Sized container frame around map - No screen bleed */}
            <div className="p-3 rounded bg-[#122438] border border-white/10 shadow-sm relative z-0">
              <div className="w-full rounded overflow-hidden" style={{ height: '480px' }}>
                <MapComponent />
              </div>
            </div>

            {/* Flat info callout */}
            <div className="p-4 rounded bg-[#122438]/50 border border-white/5 flex items-start gap-3">
              <ShieldCheck size={18} className="text-[#E0A030] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="text-white font-bold uppercase tracking-wide text-[10px]">Geospatial Deduplication Engine</p>
                <p className="text-white/60 leading-relaxed">
                  Map coordinates automatically cluster duplicate citizen reports within 150 meters. Real-time indicators weight priority scores according to municipal infrastructure contexts.
                </p>
              </div>
            </div>

          </motion.div>

        </div>

        {/* Divider */}
        <hr className="border-t border-white/10 my-16" />

        {/* Feature section - flat cards, clean typography */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Multi-Modal Intake',
              desc: 'Submit issues via simple text description, high-contrast photo uploads, or voice recordings transcribed in real-time.',
              icon: Globe,
              accent: 'text-[#E0A030]'
            },
            {
              title: 'Proximity Weighting',
              desc: 'Priority ranking logic evaluates proximity to critical infrastructure datasets (schools, medical facilities, water pipelines).',
              icon: GraduationCap,
              accent: 'text-[#E0A030]'
            },
            {
              title: 'Clustered Queues',
              desc: 'Groups duplicate complaints into single actionable incidents, ensuring representatives allocate funds where demands are highest.',
              icon: Star,
              accent: 'text-[#E0A030]'
            }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="p-6 rounded bg-[#122438] border border-white/10 space-y-4"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <item.icon size={20} className={item.accent} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight font-serif">{item.title}</h3>
              <p className="text-white/60 text-xs leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
