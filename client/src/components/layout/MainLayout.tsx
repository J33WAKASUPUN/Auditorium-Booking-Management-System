import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  // State for Mobile (Drawer)
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // State for Desktop (Minimized/Collapsed)
  const [isCollapsed, setIsCollapsed] = useState(false);

  const location = useLocation();
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 1. SIDEBAR (Fixed Left, Full Height) */}
      <Sidebar 
        isMobileOpen={isMobileOpen} 
        isCollapsed={isCollapsed}
        onCloseMobile={() => setIsMobileOpen(false)} 
      />
      
      {/* 2. WRAPPER (Pushes everything to the right of the sidebar) */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen flex flex-col",
          // Adjust margin based on sidebar width
          isCollapsed ? "lg:ml-[70px]" : "lg:ml-64"
        )}
      >
        {/* 3. HEADER (Fixed at top, but starts AFTER sidebar) */}
        <Header 
          onMenuToggle={handleToggle} 
          isCollapsed={isCollapsed}
        />
        
        {/* 4. MAIN CONTENT */}
        <main className="flex-1 pt-header section-padding animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;