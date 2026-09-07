import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/common/AppSidebar';
import AppHeader from '@/components/common/AppHeader';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { useAuth } from '@/context/AuthContext';

export default function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const { isAuthenticated } = useAuth();

  // If user is NOT logged in: Render the normal, public website layout (Navbar on top, NO sidebar, full width)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* Normal Public Website Navbar on top */}
        <Navbar />

        {/* Normal Full-Width Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        {/* Standard Footer */}
        <Footer />
      </div>
    );
  }

  // When logged in: Render the authenticated Dashboard layout with responsive AppSidebar & AppHeader
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      
      {/* Left-Side Responsive Sidebar (Desktop persistent + Mobile slide-in drawer) */}
      <AppSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isDesktopCollapsed}
        onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
      />

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        
        {/* Top Header: Logo on left & Three-dot menu on right (mobile), Sidebar toggle (desktop) */}
        <AppHeader
          onOpenSidebar={() => setMobileSidebarOpen(true)}
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>

    </div>
  );
}

