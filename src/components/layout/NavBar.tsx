import { Menu, Bell, Shield } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { useSanctuary } from '../../context/SanctuaryContext';

interface NavBarProps {
  onMenuClick: () => void;
}

export function NavBar({ onMenuClick }: NavBarProps) {
  const { crisisMode } = useSanctuary();

  return (
    <nav className="sticky top-0 z-50 bg-sanctuary-purple/95 backdrop-blur-md border-b border-sanctuary-accent/30 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-sanctuary-accent/50 rounded-lg lg:hidden"
          >
            <Menu className="w-6 h-6 text-sanctuary-light" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className={`w-8 h-8 ${crisisMode ? 'text-red-500 animate-pulse' : 'text-sanctuary-glow'}`} />
            <span className="text-xl font-bold text-sanctuary-light">SoulSanctuary</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-sanctuary-accent/50 rounded-lg">
            <Bell className="w-5 h-5 text-sanctuary-light" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-sanctuary-glow rounded-full" />
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}
