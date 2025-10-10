/**
 * Button Component - Minimalist Design System
 *
 * Variants:
 * - primary: Accent background, white text (main CTA)
 * - secondary: Outlined, hover fill (secondary actions)
 * - ghost: Minimal, hover background (tertiary actions)
 *
 * Sizes:
 * - small: 40px height
 * - default: 48px height
 * - large: 56px height
 */

import { forwardRef } from 'react';
import { cn } from '../../utils/cn.js';

export const Button = forwardRef(({
  variant = 'primary',
  size = 'default',
  className,
  children,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        'inline-flex items-center justify-center gap-2',
        'font-semibold rounded-xl',
        'transition-all duration-base',
        'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
        'active:scale-[0.98]',
        'disabled:opacity-50 disabled:pointer-events-none',

        // Variants
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-light',
        variant === 'secondary' && 'border-2 border-divider text-primary hover:border-accent hover:bg-muted',
        variant === 'ghost' && 'text-primary hover:bg-muted',

        // Sizes
        size === 'small' && 'h-10 px-4 text-caption',
        size === 'default' && 'h-12 px-6 text-body',
        size === 'large' && 'h-14 px-8 text-section',

        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
