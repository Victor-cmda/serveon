import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Toaster } from './ui/sonner';
import { cn } from '@/lib/utils';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="layout-container flex h-screen bg-muted/20 overflow-hidden">
      <Navbar 
        sidebarCollapsed={sidebarCollapsed} 
        onToggleSidebar={toggleSidebar} 
      />
      <Sidebar collapsed={sidebarCollapsed} />
      
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Close sidebar"
        />
      )}
      
      <div className={cn(
        "flex h-full w-full flex-col pt-16 overflow-hidden transition-all duration-300",
        "lg:pl-0", // Reset mobile padding
        sidebarCollapsed ? "lg:pl-16" : "lg:pl-64" // Only apply padding on desktop
      )}>
        <main className="h-full overflow-y-auto p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default Layout;
