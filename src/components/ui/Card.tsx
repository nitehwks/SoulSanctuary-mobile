import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-black/40 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/10',
        glow && 'animate-pulse-glow border-sanctuary-gold/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
