import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          // Primary - Golden gradient (matches background image)
          'bg-gradient-to-r from-sanctuary-gold to-sanctuary-amber text-sanctuary-dark shadow-lg shadow-sanctuary-gold/30 hover:from-sanctuary-amber hover:to-sanctuary-gold border border-sanctuary-gold/50': variant === 'primary',
          
          // Secondary - Glass effect
          'bg-white/10 backdrop-blur-sm text-sanctuary-cream hover:bg-white/20 border border-white/20': variant === 'secondary',
          
          // Danger
          'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30': variant === 'danger',
          
          // Ghost
          'text-sanctuary-cream hover:bg-white/10': variant === 'ghost',
          
          // Sizes
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-6 py-3 text-base': size === 'md',
          'px-8 py-4 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
