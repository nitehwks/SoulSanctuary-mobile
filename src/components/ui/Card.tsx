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
        'bg-sanctuary-purple rounded-2xl p-6 shadow-xl border border-sanctuary-accent/30',
        glow && 'animate-pulse-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
