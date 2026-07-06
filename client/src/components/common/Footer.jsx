// src/components/common/Footer.jsx
import { Link } from 'react-router-dom';
import { Zap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#060c18] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Zap size={12} className="text-white" fill="white" />
          </div>
          <span className="text-white/60 text-sm font-medium">CivicSense AI</span>
        </Link>
        <p className="text-white/30 text-xs flex items-center gap-1.5">
          Built with <Heart size={10} className="text-red-400 fill-red-400" /> for better governance ·  Powered by Gemini AI
        </p>
        <nav className="flex items-center gap-4 text-xs text-white/40">
          <Link to="/citizen" className="hover:text-white/70 transition-colors">Citizen Portal</Link>
          <Link to="/dashboard" className="hover:text-white/70 transition-colors">MP Dashboard</Link>
        </nav>
      </div>
    </footer>
  );
}
