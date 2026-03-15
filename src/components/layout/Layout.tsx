import { memo } from 'react';
import { NavBar } from './NavBar';
import { SideBar } from './SideBar';
import { CrisisBanner } from '../crisis/CrisisBanner';
import { LayoutProvider } from './LayoutContext';
import { useSanctuary } from '../../context/SanctuaryContext';

interface LayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { crisisMode } = useSanctuary();

  return (
    <div className="relative min-h-screen safe-top safe-bottom safe-left safe-right">
      {/* Background Image */}
      <div className="sanctuary-bg" />
      <div className="sanctuary-overlay" />
      
      {/* Content */}
      <div className="relative z-10">
        {crisisMode && <CrisisBanner />}
        <NavBar />
        <div className="flex">
          <SideBar />
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export const Layout = memo(function Layout({ children }: LayoutProps) {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
});
