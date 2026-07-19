// src/components/auth/AuthLayout.jsx
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[#0F2A44] relative px-4 text-[#E2E8F0]">
      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Back to Home Navigation */}
      <Link 
        to="/"
        className="absolute top-8 left-6 md:left-8 flex items-center gap-2 text-[#94A3B8] hover:text-[#E0A030] transition-colors text-xs font-bold uppercase tracking-wider group z-20"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10 my-8"
      >
        <div className="bg-[#122438] border border-white/10 rounded-xl p-8 shadow-2xl">
          
          {/* Logo Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <Link 
              to="/"
              className="w-14 h-14 rounded-full bg-[#E0A030] flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(224,160,48,0.2)] hover:scale-105 hover:shadow-[0_0_25px_rgba(224,160,48,0.4)] transition-all cursor-pointer"
            >
              <Shield size={26} className="text-[#0F2A44]" fill="currentColor" />
            </Link>
            
            <motion.div 
              key={title}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-white tracking-tight font-serif">{title}</h2>
              <p className="text-[#94A3B8] text-sm mt-2 max-w-xs leading-relaxed mx-auto">
                {subtitle}
              </p>
            </motion.div>
          </div>

          {children}

        </div>
      </motion.div>
    </div>
  );
}
