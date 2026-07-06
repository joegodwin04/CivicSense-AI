// src/components/ui/Card.jsx
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function Card({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'rounded bg-[#122438] border border-white/10 transition-all duration-200',
        hover && 'hover:border-[#E0A030]/50 hover:bg-white/[0.03]',
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
