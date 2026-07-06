// src/components/common/NotificationToast.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const icons = {
  success: { Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  error:   { Icon: XCircle,     color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  warning: { Icon: AlertCircle, color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  info:    { Icon: Info,        color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
};

export default function NotificationToast() {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map(({ id, type = 'info', title, message }) => {
          const { Icon, color, bg } = icons[type] || icons.info;
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm px-4 py-3.5 rounded-2xl border backdrop-blur-xl ${bg} shadow-xl`}
            >
              <Icon size={18} className={`${color} shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                {title && <p className="text-white text-sm font-semibold leading-none mb-0.5">{title}</p>}
                {message && <p className="text-white/60 text-xs leading-relaxed">{message}</p>}
              </div>
              <button
                onClick={() => removeNotification(id)}
                className="shrink-0 text-white/30 hover:text-white/70 transition-colors ml-1"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
