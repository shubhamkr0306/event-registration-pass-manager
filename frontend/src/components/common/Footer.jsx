import React from 'react';
import { Ticket } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-teal-600" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">EventPass</span>
          <span>© {new Date().getFullYear()} </span>
        </div>
        <p>Event Registration & Pass Manager</p>
      </div>
    </footer>
  );
}
