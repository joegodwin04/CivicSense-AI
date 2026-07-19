// src/components/auth/RoleSelector.jsx
import { motion } from 'framer-motion';

export default function RoleSelector({ role, setRole }) {
  const isCitizen = role === 'citizen';

  return (
    <div className="relative flex p-1 bg-[#0B0F19] rounded-lg border border-white/5 mb-8">
      <button
        type="button"
        onClick={() => setRole('citizen')}
        className={`relative flex-1 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors z-10 ${
          isCitizen ? 'text-[#0F2A44]' : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        Citizen
      </button>

      <button
        type="button"
        onClick={() => setRole('mp')}
        className={`relative flex-1 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors z-10 ${
          !isCitizen ? 'text-[#0F2A44]' : 'text-[#94A3B8] hover:text-white'
        }`}
      >
        MP Desk
      </button>

      <motion.div
        className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#E0A030] rounded-md shadow-sm z-0"
        initial={false}
        animate={{
          left: isCitizen ? '4px' : 'calc(50%)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    </div>
  );
}
