import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public & Attendee Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/verify-pass" element={<VerifyPassPublicPage />} />
          <Route path="/my-passes" element={<MyPassesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Organizer Console / Dashboard Layout Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverviewPage />} />
          <Route path="events" element={<ManageEventsPage />} />
          <Route path="scanner" element={<LiveScannerPage />} />
          <Route path="attendees" element={<EventAttendeesPage />} />
          <Route path="analytics" element={<EventAnalyticsPage />} />
        </Route>

        {/* Fallback wildcard redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
