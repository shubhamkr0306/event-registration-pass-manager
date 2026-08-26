import React from 'react';
import { Menu } from 'lucide-react';

export default function DashboardHeader({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
          Organizer Console
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-xs">
          SK
        </div>
        <span className="hidden sm:inline text-xs font-medium text-slate-700 dark:text-slate-300">
          Shubham Kumar
        </span>
      </div>
    </header>
  );
}
