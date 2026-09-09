import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Ticket, 
  Menu, 
  MoreVertical, 
  LogIn, 
  UserPlus, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AppHeader({ onOpenSidebar, isCollapsed, onToggleCollapse }) {
  const { user, isAuthenticated, isOrganizer, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      
      {/* --- MOBILE VIEW: Logo on Left, Profile + Three-Dot on Right --- */}
      <div className="flex w-full items-center justify-between lg:hidden">
        
        {/* Left Side: Brand Logo */}
        <Link 
          to={isAdmin ? '/admin' : isOrganizer ? '/dashboard' : '/'} 
          className="flex items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-500/20">
            <Ticket className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Event<span className="text-teal-600 dark:text-teal-400">Pass</span>
          </span>
        </Link>

        {/* Right Side: Profile Icon & Three-Dot Menu Button */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold ${
                isAdmin ? 'bg-purple-600' : isOrganizer ? 'bg-teal-600' : 'bg-blue-600'
              }`}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 px-2 py-1"
            >
              Sign In
            </Link>
          )}

          {/* Three-Dot Menu Trigger for Left-Side Sidebar Drawer */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-colors"
            title="Open Menu"
            aria-label="Toggle navigation drawer"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

      </div>

      {/* --- DESKTOP VIEW: Clean Context Breadcrumbs on Left, Profile on Right --- */}
      <div className="hidden lg:flex w-full items-center justify-between">
        
        {/* Left Side: Clean context breadcrumb */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            {isAdmin ? 'Admin Console' : isOrganizer ? 'Organizer Hub' : 'EventPass'}
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {location.pathname === '/' ? 'Home' : 
             location.pathname === '/admin' ? 'System Overview' :
             location.pathname === '/dashboard' ? 'Overview' :
             location.pathname === '/dashboard/events' ? 'Manage Events' :
             location.pathname === '/dashboard/scanner' ? 'Live QR Scanner' :
             location.pathname === '/dashboard/attendees' ? 'Attendees & Check-In' :
             location.pathname === '/dashboard/analytics' ? 'Event Analytics' :
             location.pathname.startsWith('/events/') ? 'Event Details' :
             location.pathname.startsWith('/events') ? 'Explore Events' : 
             location.pathname === '/my-passes' ? 'My Passes' :
             location.pathname === '/verify-pass' ? 'Verify Pass' :
             location.pathname === '/login' ? 'Sign In' :
             location.pathname === '/register' ? 'Register' :
             'Portal'}
          </span>
        </div>

        {/* Right Side: Auth Profile / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-[11px] font-bold ${
                  isAdmin ? 'bg-purple-600' : isOrganizer ? 'bg-teal-600' : 'bg-blue-600'
                }`}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                    {user?.name}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                    isAdmin ? 'text-purple-600 dark:text-purple-400' : 'text-teal-600 dark:text-teal-400'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl dark:text-slate-200 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
