# Event Registration & Digital Pass Manager

A web application for creating events and letting users register to get a digital pass with a QR code. Organizers can create events, manage registrations, and scan/verify passes at the venue.

Built with React, Node.js, Express, and PostgreSQL.

## Features

- **User Authentication & Roles**: Support for Attendees, Organizers, and Admins.
- **Event Management**: Organizers can create, edit, and manage events with capacity limits.
- **Pass Generation**: Users get a digital pass with a QR code upon registration. Passes can also be downloaded as images.
- **Pass Verification**: Venue check-in using either manual pass code entry or device camera QR scanner.
- **Dashboards**: Analytics, attendance stats, attendee lists with CSV export, and admin user management.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Auth**: JWT and bcrypt

## Getting Started

### 1. Database
Make sure PostgreSQL is running on your machine and create a database named `shnoor_event_db`:
```bash
createdb shnoor_event_db
```
Tables and initial demo data are created automatically when the backend starts.

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # seeds initial demo accounts and events
npm run dev      # runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # runs on http://localhost:5173
```

## Demo Credentials

You can log in with any of these pre-seeded accounts (password is `password123` for all):

- **Admin**: `admin@shnoor.com`
- **Organizer**: `organizer@shnoor.com`
- **Attendee**: `attendee@shnoor.com`
