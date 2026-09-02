import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function OrganizerRoute({ children }) {
  const { user, isAuthenticated, isOrganizer, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
          <span>Verifying organizer privileges...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Administrators have their dedicated Admin Console (/admin), redirect them there
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (!isOrganizer) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center dark:border-rose-900/50 dark:bg-rose-950/40">
        <ShieldAlert className="h-10 w-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-900 dark:text-rose-200">Organizer Access Required</h2>
        <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
          You are currently signed in as an <strong>{user?.role}</strong>. Please log in with an Organizer account to access the Organizer Hub.
        </p>
      </div>
    );
  }

  return children;
}
