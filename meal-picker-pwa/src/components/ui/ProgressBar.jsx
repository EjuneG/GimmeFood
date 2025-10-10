/**
 * ProgressBar Component - Minimalist Design System
 *
 * Monochrome progress bar for nutrition tracking
 * Features animated fill with smooth transitions
 */

import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

export function ProgressBar({
  value = 0,
  max = 100,
  className,
  animate = true,
  ...props
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        'relative h-1.5 bg-divider rounded-full overflow-hidden',
        className
      )}
      {...props}
    >
      {animate ? (
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0.0, 0.6, 1] }}
          className="absolute h-full bg-primary rounded-full"
        />
      ) : (
        <div
          className="absolute h-full bg-primary rounded-full transition-all duration-slower"
          style={{ width: `${percentage}%` }}
        />
      )}
    </div>
  );
}
