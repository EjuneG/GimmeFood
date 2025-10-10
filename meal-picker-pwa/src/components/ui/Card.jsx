/**
 * Card Component - Minimalist Design System
 *
 * A simple container component with consistent styling
 * for elevated content surfaces
 */

import { cn } from '../../utils/cn.js';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl shadow-sm border border-divider p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
