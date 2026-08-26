import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ScanLine, Users, BarChart3, ArrowLeft, Ticket } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const navigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Manage Events', path: '/dashboard/events', icon: CalendarDays },
    { name: 'Live QR Scanner', path: '/dashboard/scanner', icon: ScanLine },
    { name: 'Attendees & Check-In', path: '/dashboard/attendees', icon: Users },
    { name: 'Event Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-transform duration-200 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-teal-600" />
            <span className="font-bold text-slate-900 dark:text-white">OrganizerHub</span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-between p-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold dark:bg-teal-950/60 dark:text-teal-400'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Public Site</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
