import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home,
  Ticket, 
  Calendar, 
  QrCode, 
  LayoutDashboard, 
  Menu, 
  X, 
  LogIn, 
  UserPlus,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer, isAdmin, logout } = useAuth();

  // Navigation link configuration (Role-based: Verify Pass is for Organizers & Admins only)
  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore Events', path: '/events', icon: Calendar },
    ...(isAuthenticated && !isAdmin ? [{ name: 'My Passes', path: '/my-passes', icon: Ticket }] : []),
    ...((isOrganizer || isAdmin) ? [{ name: 'Verify Pass', path: '/verify-pass', icon: QrCode }] : []),
    ...(isOrganizer && !isAdmin ? [{ name: 'Organizer Hub', path: '/dashboard', icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ name: 'Admin Console', path: '/admin', icon: ShieldCheck }] : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-500/20">
            <Ticket className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Event<span className="text-teal-600 dark:text-teal-400">Pass</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Side: Auth State or Profile Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* User Profile Pill */}
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

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg dark:text-slate-200 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 dark:border-slate-800 dark:bg-slate-900">
          
          {/* User Profile Info on Mobile if logged in */}
          {isAuthenticated && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white font-bold text-xs ${
                  isAdmin ? 'bg-purple-600' : isOrganizer ? 'bg-teal-600' : 'bg-blue-600'
                }`}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">{user?.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Nav Links */}
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200"
              >
                <Icon className="h-4 w-4 text-teal-600" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Auth Actions on Mobile if logged out */}
          {!isAuthenticated && (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-teal-600 text-sm font-medium text-white shadow-sm"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </Link>
            </div>
          )}

        </div>
      )}
    </header>
  );
}
