// src/components/ui/Card.jsx
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function Card({ children, className, hover = true, glow, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm transition-all duration-300',
        hover && 'hover:bg-white/[0.06] hover:border-white/[0.1] hover:-translate-y-0.5',
        glow === 'blue' && 'hover:shadow-lg hover:shadow-blue-500/10',
        glow === 'purple' && 'hover:shadow-lg hover:shadow-purple-500/10',
        glow === 'red' && 'hover:shadow-lg hover:shadow-red-500/10',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={clsx('px-6 pt-6 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={clsx('px-6 pb-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={clsx('text-base font-semibold text-white tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}
