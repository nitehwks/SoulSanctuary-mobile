import { NavLink } from 'react-router-dom';
import { 
  Home, Smile, Target, Brain, BarChart3, 
  HeartHandshake, Settings, X 
} from 'lucide-react';

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/mood', icon: Smile, label: 'Mood' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/crisis', icon: HeartHandshake, label: 'Crisis Support' },
  { to: '/profile', icon: Settings, label: 'Settings' },
];

export function SideBar({ isOpen, onClose }: SideBarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sanctuary-purple border-r border-sanctuary-accent/30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 flex justify-between items-center lg:hidden">
          <span className="text-lg font-bold text-sanctuary-light">Menu</span>
          <button onClick={onClose} className="p-2 hover:bg-sanctuary-accent/50 rounded-lg">
            <X className="w-5 h-5 text-sanctuary-light" />
          </button>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => onClose()}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-sanctuary-glow/20 text-sanctuary-glow border border-sanctuary-glow/30' 
                  : 'text-sanctuary-light/70 hover:bg-sanctuary-accent/30 hover:text-sanctuary-light'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
