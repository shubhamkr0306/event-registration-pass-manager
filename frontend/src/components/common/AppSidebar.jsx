import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Home,
  Ticket, 
  Calendar, 
  QrCode, 
  LayoutDashboard, 
  ShieldCheck, 
  X, 
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';

export default function AppSidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const location = useLocation();
  const { isAuthenticated, isOrganizer, isAdmin } = useAuth();

  // Navigation link configuration (Role-based: Verify Pass is for Organizers & Admins only)
  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore Events', path: '/events', icon: Calendar },
    ...(isAuthenticated && !isAdmin ? [{ name: 'My Passes', path: '/my-passes', icon: Ticket }] : []),
    ...((isOrganizer || isAdmin) ? [{ name: 'Verify Pass', path: '/verify-pass', icon: QrCode }] : []),
    ...(isOrganizer && !isAdmin ? [{ name: 'Organizer Hub', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ name: 'Admin Console', path: '/admin', icon: ShieldCheck }] : []),
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-200',
          // Mobile slide-in drawer
          isOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full lg:translate-x-0',
          // Desktop: sticky, full viewport height, strictly shrink-0 so it never squashes or clashes
          'lg:static lg:sticky lg:top-0 lg:h-screen lg:shrink-0',
          // Desktop width: 80px (w-20) when collapsed, 256px (w-64) when expanded
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        )}
      >
        
        {/* Clean Sidebar Header with Brand + Integrated Desktop Collapse Toggle */}
        <div className={cn(
          'flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {/* When expanded on desktop or inside mobile drawer: Logo + Name */}
          {(!isCollapsed || isOpen) ? (
            <>
              <Link 
                to="/" 
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 overflow-hidden"
                title="EventPass Home"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-500/20">
                  <Ticket className="h-5 w-5" />
                </div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  Event<span className="text-teal-600 dark:text-teal-400">Pass</span>
                </span>
              </Link>

              {/* Desktop-Only Collapse Button */}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                title="Collapse Sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            /* When collapsed on desktop: Centered clickable icon that expands sidebar */
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-500/20 hover:bg-teal-700 transition-all hover:scale-105"
              title="Click to Expand Sidebar"
              aria-label="Expand sidebar"
            >
              <Ticket className="h-5 w-5" />
            </button>
          )}

          {/* Mobile-Only Close Button (Hidden on Desktop) */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links Area */}
        <div className="flex flex-1 flex-col justify-between p-3 overflow-y-auto">
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={handleLinkClick}
                  title={isCollapsed && !isOpen ? item.name : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors',
                    isCollapsed && !isOpen && 'justify-center px-2',
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold dark:bg-teal-950/60 dark:text-teal-400'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  {(!isCollapsed || isOpen) && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

      </aside>
    </>
  );
}
