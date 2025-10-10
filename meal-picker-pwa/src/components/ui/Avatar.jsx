/**
 * Avatar Component - Minimalist Design System
 *
 * Restaurant avatar displaying initial character
 * Featured avatars use accent color, others use muted background
 */

import { cn } from '../../utils/cn.js';

export function Avatar({
  initial = '?',
  featured = false,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center text-body font-semibold flex-shrink-0',
        featured
          ? 'bg-accent text-white'
          : 'bg-muted border-2 border-divider text-primary',
        className
      )}
      {...props}
    >
      {initial}
    </div>
  );
}
