import { useState } from 'react';
import { NavBar } from './NavBar';
import { SideBar } from './SideBar';
import { CrisisBanner } from '../crisis/CrisisBanner';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sanctuary-dark safe-top safe-bottom safe-left safe-right">
      <CrisisBanner />
      <NavBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
