// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'mp') {
        navigate('/dashboard');
      } else {
        navigate('/citizen');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#122438] border border-white/10 rounded p-8">
          
          {/* Logo Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E0A030] flex items-center justify-center mb-4">
              <Shield size={22} className="text-[#0F2A44]" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-serif">Welcome Back</h2>
            <p className="text-[#94A3B8] text-xs uppercase font-bold tracking-wider mt-1">MP Representative Access Desk</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-2.5 rounded bg-red-950/20 border border-red-500/25 text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="representative@constituency.gov"
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
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0B0F19] border border-white/10 rounded pl-10 pr-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] transition-colors"
                />
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
              className="w-full uppercase font-bold tracking-wider"
            >
              Sign In
            </Button>
          </form>

          {/* Seed accounts mention */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[#94A3B8] text-xs">
              Demo Credentials: <span className="font-bold text-white">mp@civicsense.ai</span> / <span className="font-bold text-white">password123</span>
            </p>
          </div>

          {/* Link to Register */}
          <div className="mt-4 text-center">
            <span className="text-[#94A3B8] text-xs">Need an account? </span>
            <Link to="/register" className="text-[#E0A030] hover:text-[#F0B040] text-xs font-bold underline underline-offset-2 no-underline">
              Register here
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
