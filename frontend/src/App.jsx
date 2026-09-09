import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

// Layouts
import MainLayout from '@/layouts/MainLayout';

// Route Guards
import AdminRoute from '@/components/common/AdminRoute';
import OrganizerRoute from '@/components/common/OrganizerRoute';

// Public & Auth Pages
import HomePage from '@/pages/public/HomePage';
import EventsPage from '@/pages/public/EventsPage';
import EventDetailsPage from '@/pages/public/EventDetailsPage';
import VerifyPassPublicPage from '@/pages/public/VerifyPassPublicPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Attendee Pages
import MyPassesPage from '@/pages/attendee/MyPassesPage';

// Organizer Dashboard Pages
import DashboardOverviewPage from '@/pages/organizer/DashboardOverviewPage';
import ManageEventsPage from '@/pages/organizer/ManageEventsPage';
import LiveScannerPage from '@/pages/organizer/LiveScannerPage';
import EventAttendeesPage from '@/pages/organizer/EventAttendeesPage';
import EventAnalyticsPage from '@/pages/organizer/EventAnalyticsPage';

// Admin Console Page
import AdminPanelPage from '@/pages/admin/AdminPanelPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Unified Application Layout (All Roles: Admin, Organizer, Attendee, Public) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/verify-pass" element={<VerifyPassPublicPage />} />
            <Route path="/my-passes" element={<MyPassesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Admin Console Route */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPanelPage />
                </AdminRoute>
              } 
            />

            {/* Organizer Console Routes (Guarded by OrganizerRoute, Unified in MainLayout) */}
            <Route 
              path="/dashboard" 
              element={
                <OrganizerRoute>
                  <DashboardOverviewPage />
                </OrganizerRoute>
              } 
            />
            <Route 
              path="/dashboard/events" 
              element={
                <OrganizerRoute>
                  <ManageEventsPage />
                </OrganizerRoute>
              } 
            />
            <Route 
              path="/dashboard/scanner" 
              element={
                <OrganizerRoute>
                  <LiveScannerPage />
                </OrganizerRoute>
              } 
            />
            <Route 
              path="/dashboard/attendees" 
              element={
                <OrganizerRoute>
                  <EventAttendeesPage />
                </OrganizerRoute>
              } 
            />
            <Route 
              path="/dashboard/analytics" 
              element={
                <OrganizerRoute>
                  <EventAnalyticsPage />
                </OrganizerRoute>
              } 
            />
          </Route>

          {/* Fallback wildcard redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
