/**
 * Radio Component - Minimalist Design System
 *
 * Custom radio button with spring animation on selection
 * Follows design system with accent color and smooth transitions
 */

import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

export function Radio({
  checked = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-base',
        checked ? 'border-accent' : 'border-secondary',
        className
      )}
      {...props}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
          className="w-3 h-3 rounded-full bg-accent"
        />
      )}
    </div>
  );
}
