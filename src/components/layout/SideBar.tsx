import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, MessageCircle, Smile, Target, Brain, BarChart3, 
  HeartHandshake, Settings, X, Sparkles, Cross
} from 'lucide-react';
import { useLayout } from './LayoutContext';

interface NavItem {
  to: string;
  icon: typeof Home;
  label: string;
  primary?: boolean;
}

const navItems: NavItem[] = [
  { to: '/coach', icon: MessageCircle, label: 'AI Coach', primary: true },
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/mood', icon: Smile, label: 'Mood' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/memory', icon: Brain, label: 'Memory' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/crisis', icon: HeartHandshake, label: 'Crisis Support' },
  { to: '/profile', icon: Settings, label: 'Settings' },
];

export const SideBar = memo(function SideBar() {
  const { sidebarOpen, closeSidebar } = useLayout();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      <aside 
        className={`
          fixed lg:sticky inset-y-0 left-0 z-50 w-64 
          bg-black/80 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Main navigation"
      >
        <div className="p-4 flex justify-between items-center lg:hidden">
          <div className="flex items-center gap-2">
            <Cross className="w-5 h-5 text-sanctuary-gold" />
            <span className="text-lg font-bold text-sanctuary-cream">Menu</span>
          </div>
          <button 
            onClick={closeSidebar} 
            className="p-2 hover:bg-white/10 rounded-lg text-sanctuary-cream"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Logo area - desktop only */}
        <div className="hidden lg:flex items-center gap-3 p-4 border-b border-white/10">
          <div className="p-2 bg-sanctuary-gold/20 rounded-lg border border-sanctuary-gold/30">
            <Cross className="w-5 h-5 text-sanctuary-gold" />
          </div>
          <span className="font-bold text-sanctuary-cream">Navigation</span>
        </div>
        
        <nav className="p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, primary }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${primary 
                  ? isActive
                    ? 'bg-gradient-to-r from-sanctuary-gold/40 to-sanctuary-amber/30 text-sanctuary-gold border border-sanctuary-gold/50 shadow-lg shadow-sanctuary-gold/10'
                    : 'bg-sanctuary-gold/20 text-sanctuary-gold border border-sanctuary-gold/30 hover:bg-sanctuary-gold/30'
                  : isActive 
                    ? 'bg-white/10 text-sanctuary-gold border border-sanctuary-gold/30' 
                    : 'text-sanctuary-cream/70 hover:bg-white/5 hover:text-sanctuary-cream'}
              `}
            >
              <Icon className={`w-5 h-5 ${primary ? 'text-sanctuary-gold' : ''}`} />
              <span className="font-medium">{label}</span>
              {primary && (
                <Sparkles className="w-3.5 h-3.5 ml-auto text-sanctuary-gold" />
              )}
            </NavLink>
          ))}
        </nav>
        
        {/* Scripture quote at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-black/40">
          <p className="text-xs text-sanctuary-cream/50 italic text-center">
            "The Lord is close to the brokenhearted"
          </p>
          <p className="text-xs text-sanctuary-gold/70 text-center mt-1">Psalm 34:18</p>
        </div>
      </aside>
    </>
  );
});
