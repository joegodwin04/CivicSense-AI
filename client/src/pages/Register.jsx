// src/pages/Register.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, MapPin, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import AuthLayout from '../components/auth/AuthLayout';
import RoleSelector from '../components/auth/RoleSelector';

export default function Register() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultRole = queryParams.get('role') === 'mp' ? 'mp' : 'citizen';

  const [role, setRole] = useState(defaultRole);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [constituency, setConstituency] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useApp();
  const navigate = useNavigate();

  const isCitizen = role === 'citizen';

  useEffect(() => {
    setError('');
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Base validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Role-specific validation
    if (isCitizen) {
      if (!phoneNumber) {
        setError('Phone number is required for citizens.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
    } else {
      if (!constituency) {
        setError('Constituency is required for MP Representatives.');
        return;
      }
      const isGovEmail = email.endsWith('@gov.in') || email.endsWith('@nic.in');
      if (!isGovEmail) {
        setError('MPs must register with a government email ending in @gov.in or @nic.in');
        return;
      }
    }

    setError('');
    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        role,
        ...(isCitizen ? { phoneNumber } : { constituency })
      };

      const user = await register(payload);
      
      if (user.isPending) {
        navigate('/login?role=mp');
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

  const title = isCitizen ? 'Create Citizen Account' : 'Register as MP Representative';
  const subtitle = isCitizen 
    ? 'Instant registration. Immediate access to file and track civic reports.' 
    : 'Registration requires Admin verification. Access granted after approval.';

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <RoleSelector role={role} setRole={setRole} />

      {error && (
        <div className="mb-6 px-4 py-3 rounded bg-red-950/30 border border-red-500/30 text-red-300 text-xs text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5 text-left">
          <label className="block text-[11px] font-bold text-white/70 uppercase tracking-widest">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
              <User size={16} />
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full bg-[#0B0F19] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] focus:ring-1 focus:ring-[#E0A030] transition-all"
            />
          </div>
        </div>

        {/* Email */}
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
              placeholder={isCitizen ? "john@example.com" : "representative@gov.in"}
              required
              className="w-full bg-[#0B0F19] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] focus:ring-1 focus:ring-[#E0A030] transition-all"
            />
          </div>
        </div>

        {/* Dynamic Field: Phone (Citizen) or Constituency (MP) */}
        {isCitizen ? (
          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-bold text-white/70 uppercase tracking-widest">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                required={isCitizen}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] focus:ring-1 focus:ring-[#E0A030] transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-bold text-white/70 uppercase tracking-widest">
              Constituency
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
                <MapPin size={16} />
              </span>
              <input
                type="text"
                value={constituency}
                onChange={(e) => setConstituency(e.target.value)}
                placeholder="e.g. Bengaluru Central"
                required={!isCitizen}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] focus:ring-1 focus:ring-[#E0A030] transition-all"
              />
            </div>
          </div>
        )}

        {/* Password */}
        <div className="grid grid-cols-2 gap-3">
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
                placeholder="Min 6 chars"
                minLength={6}
                required
                className="w-full bg-[#0B0F19] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] focus:ring-1 focus:ring-[#E0A030] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-bold text-white/70 uppercase tracking-widest">
              Confirm
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#94A3B8]">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype"
                minLength={6}
                required
                className="w-full bg-[#0B0F19] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#E0A030] focus:ring-1 focus:ring-[#E0A030] transition-all"
              />
            </div>
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
          className="w-full mt-4 uppercase font-bold tracking-widest py-3.5 shadow-lg shadow-[#E0A030]/10"
        >
          {isCitizen ? 'Create Account' : 'Submit Registration'}
        </Button>
      </form>

      <div className="mt-6 text-center pt-5 border-t border-white/10">
        <span className="text-[#94A3B8] text-[13px]">Already have an account? </span>
        <Link 
          to={`/login?role=${role}`} 
          className="text-[#E0A030] hover:text-[#F0B040] text-[13px] font-bold underline underline-offset-4 decoration-2 decoration-[#E0A030]/30 hover:decoration-[#E0A030] transition-all"
        >
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
