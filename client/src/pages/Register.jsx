// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, MapPin, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [constituency, setConstituency] = useState('Bengaluru Central');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !constituency) {
      setError('Please fill in all fields.');
      return;
    }

    if (role === 'mp') {
      const isGovEmail = email.endsWith('@gov.in') || email.endsWith('@nic.in');
      if (!isGovEmail) {
        setError('MPs must register with a government email ending in @gov.in or @nic.in');
        return;
      }
    }

    setError('');
    setLoading(true);
    try {
      const user = await register({
        name,
        email,
        password,
        role,
        constituency
      });
      
      if (user.isPending) {
        navigate('/login');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'mp') {
        navigate('/dashboard');
      } else {
        navigate('/citizen');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10 my-8"
      >
        <div className="bg-[#122438] border border-white/10 rounded p-8">
          
          {/* Logo Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E0A030] flex items-center justify-center mb-4">
              <Shield size={22} className="text-[#0F2A44]" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-serif">Create Account</h2>
            <p className="text-[#94A3B8] text-xs uppercase font-bold tracking-wider mt-1">Join the Civic Triage Network</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded bg-red-950/20 border border-red-500/25 text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#94A3B8]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-[#0B0F19] border border-white/10 rounded pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#94A3B8]">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="w-full bg-[#0B0F19] border border-white/10 rounded pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#94A3B8]">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                  className="w-full bg-[#0B0F19] border border-white/10 rounded pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] transition-colors"
                />
              </div>
            </div>

            {/* Constituency */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">Constituency</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#94A3B8]">
                  <MapPin size={16} />
                </span>
                <input
                  type="text"
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  placeholder="e.g. Bengaluru Central"
                  required
                  className="w-full bg-[#0B0F19] border border-white/10 rounded pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] transition-colors"
                />
              </div>
            </div>

            {/* Role Select */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`py-2 px-4 rounded border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    role === 'citizen'
                      ? 'bg-[#E0A030]/15 border-[#E0A030] text-[#E0A030]'
                      : 'bg-[#0B0F19] border-white/10 text-white hover:border-white/20'
                  }`}
                >
                  Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('mp')}
                  className={`py-2 px-4 rounded border text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    role === 'mp'
                      ? 'bg-[#E0A030]/15 border-[#E0A030] text-[#E0A030]'
                      : 'bg-[#0B0F19] border-white/10 text-white hover:border-white/20'
                  }`}
                >
                  MP Desk
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              icon={ArrowRight}
              iconPosition="right"
              rounded="rounded"
              className="w-full mt-2 uppercase font-bold tracking-wider"
            >
              Sign Up
            </Button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 text-center">
            <span className="text-[#94A3B8] text-xs">Already have an account? </span>
            <Link to="/login" className="text-[#E0A030] hover:text-[#F0B040] text-xs font-bold underline underline-offset-2 no-underline">
              Sign In
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
