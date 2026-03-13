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
        'inline-flex items-center justify-center rounded-full font-medium transition-all active:scale-95',
        {
          'bg-sanctuary-glow text-white hover:bg-opacity-90': variant === 'primary',
          'bg-sanctuary-accent text-sanctuary-light hover:bg-opacity-80': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          'hover:bg-sanctuary-accent/50': variant === 'ghost',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-6 py-3': size === 'md',
          'px-8 py-4 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
