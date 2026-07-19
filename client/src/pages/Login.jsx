// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import AuthLayout from '../components/auth/AuthLayout';
import RoleSelector from '../components/auth/RoleSelector';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useApp();

  const queryParams = new URLSearchParams(location.search);
  const defaultRole = queryParams.get('role') === 'mp' ? 'mp' : 'citizen';
  
  const [role, setRole] = useState(defaultRole);

  useEffect(() => {
    setError('');
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // The backend login is generic. We just pass email/password.
      const user = await login(email, password, role);
      
      // Navigate based on actual authenticated role, not necessarily the tab selected
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

  const isCitizen = role === 'citizen';
  const title = isCitizen ? 'Citizen Portal' : 'MP Representative Portal';
  const subtitle = isCitizen 
    ? 'Sign in to submit, track and manage your civic reports.' 
    : 'Secure access for constituency management and citizen issue monitoring.';

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <RoleSelector role={role} setRole={setRole} />

      {error && (
        <div className="mb-6 px-4 py-3 rounded bg-red-950/30 border border-red-500/30 text-red-300 text-xs text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5 text-left">
          <label className="block text-[11px] font-bold text-white/70 uppercase tracking-widest">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isCitizen ? "citizen@example.com" : "representative@gov.in"}
              required
              className="w-full bg-[#0B0F19] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] focus:ring-1 focus:ring-[#E0A030] transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="block text-[11px] font-bold text-white/70 uppercase tracking-widest">
            Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
              <Lock size={16} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#0B0F19] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] focus:ring-1 focus:ring-[#E0A030] transition-all"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          icon={ArrowRight}
          iconPosition="right"
          rounded="rounded-lg"
          className="w-full mt-2 uppercase font-bold tracking-widest py-3.5 shadow-lg shadow-[#E0A030]/10"
        >
          Sign In to Portal
        </Button>
      </form>

      {!isCitizen && (
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-[#94A3B8] text-[11px]">
            Demo Credentials: <span className="font-bold text-white">mp@civicsense.ai</span> / <span className="font-bold text-white">password123</span>
          </p>
        </div>
      )}

      <div className="mt-6 text-center">
        <span className="text-[#94A3B8] text-[13px]">New to CivicSense? </span>
        <Link 
          to={`/register?role=${role}`} 
          className="text-[#E0A030] hover:text-[#F0B040] text-[13px] font-bold underline underline-offset-4 decoration-2 decoration-[#E0A030]/30 hover:decoration-[#E0A030] transition-all"
        >
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}
