# EventPass - Event Registration & Digital Pass Manager

A full-stack web application built for organizations to create and manage events, and for attendees to discover events, register online, and receive digital entry passes. Event organizers and venue staff can scan passes in real time using a camera or manual code entry to admit guests and track turnout.

Built by **Shubham Kumar** as part of the technical assessment.

---

## What This Project Does

When organizing events, managing registrations, issuing physical passes, and tracking who actually attended is usually chaotic. EventPass solves this by offering an end-to-end workflow:

1. **Event Discovery & Booking**: Attendees can search and filter upcoming events by title, category, and venue, and reserve seats in real-time.
2. **Capacity Control & Duplicate Prevention**: The system strictly enforces event capacity limits and prevents duplicate registrations for the same event by the same user.
3. **Unique Digital Passes**: Each successful booking generates a unique digital pass with an alphanumeric pass code (e.g. `PASS-XXXX-XXXX`) and a secure QR code that attendees can view or download as an image.
4. **Gate Check-In & Live Verification**: Venue staff can verify passes live on their phone or laptop using the built-in camera QR scanner or by typing the pass code. With one click, attendees are marked as checked in (`USED`), preventing pass reuse.
5. **Organizer Hub**: Event creators get their own dedicated dashboard to track hosted events, ticket sales, fill rates, gross revenue, participant lists with CSV export, and attendance analytics.
6. **Admin Console**: Administrators can manage platform users, assign or update roles (Attendee, Organizer, Admin), oversee all events, and view platform-wide analytics.

---

## Role-Based Access Control

The application provides three distinct roles:

| Role | Permissions & Features |
| :--- | :--- |
| **Attendee** | Browse events, book passes, view and download digital pass QR codes, filter active vs. attended events. |
| **Organizer** | Create and manage events, view seat capacity and revenue, access the live camera QR scanner, view attendee lists with CSV export, and track turnout analytics. |
| **Admin** | System-wide statistics, manage users and promote/demote roles, delete accounts, view all attendee records, and platform analytics. |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, `html5-qrcode` (camera QR scanning), `qrcode` (SVG/Canvas QR generation).
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL with `pg` connection pooling.
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing.
- **Security**: AES-256-GCM authenticated encryption for pass QR code payloads to prevent ticket forgery or data tampering.

---

## Quick Start / Setup Instructions

### Prerequisites
Before running the project locally, make sure you have:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node)
- **PostgreSQL** (running locally on port 5432 or a hosted PostgreSQL URL)

---

### Step 1: Database Setup

1. Open your PostgreSQL terminal (or pgAdmin / DBeaver) and create a new database:
   ```sql
   CREATE DATABASE shnoor_event_db;
   ```
2. The backend handles schema creation automatically on startup (`initDb`), so you do not need to manually run SQL create tables commands.

---

### Step 2: Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory (you can copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
4. Update the database credentials in `.env` if needed:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173

   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=shnoor_event_db

   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRES_IN=7d
   ```
5. Seed demo accounts and initial events:
   ```bash
   npm run seed
   ```
6. Start the backend development server:
   ```bash
   npm run dev
   ```
   The API will run at `http://localhost:5000`.

---

### Step 3: Frontend Setup

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. (Optional) If your backend runs on a different port or URL, configure `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:5173`.

---

## Demo Login Credentials

You can use these pre-seeded accounts to test each role right away:

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@shnoor.com` | `password123` | System stats, user management, change roles, all attendees. |
| **Organizer** | `organizer@shnoor.com` | `password123` | Create events, live camera QR scanner, CSV export, analytics. |
| **Attendee** | `attendee@shnoor.com` | `password123` | Book events, view pass QR codes, download passes. |

You can also register a new account on the registration page (default role is `ATTENDEE`, or toggle to `ORGANIZER`).

---

## Core Features Walkthrough

### 1. Unified Navigation Layout
The navigation adapts automatically to your logged-in role:
- **Organizers** see all their tools directly in the sidebar (`Overview`, `Manage Events`, `Live QR Scanner`, `Attendees & Check-In`, `Event Analytics`, `Explore Events`) without confusing layout switches or public marketing screens.
- **Admins** have direct access to `Admin Console`, `Verify Pass`, and `Explore Events`.
- **Attendees** have quick access to `My Passes` and `Explore Events`.

### 2. Digital Passes with Offline QR Code
- After booking an event, attendees get an instant pass modal and can revisit it at any time in **My Passes**.
- Passes include attendee name, event title, venue, date, unique pass code, and QR code.
- Includes a 1-click **Download QR** button that saves the pass QR code as a PNG image to your device.

### 3. Live Camera QR Scanner & Gate Check-In
- Organizers and staff can open their device camera directly in the browser.
- When an attendee presents their pass QR code, the camera detects it instantly, verifies the pass against PostgreSQL, and allows the gatekeeper to admit the attendee with a single click.
- If a camera is unavailable, staff can type or paste the code or use a USB barcode/QR scanner gun.
- Passes already checked in display a clear warning (`USED`) with the original check-in timestamp to prevent reuse.

### 4. Participant List CSV Export
- Organizers can download the complete list of registered attendees for any event as a `.csv` file.
- Includes Attendee Name, Email, Event Title, Pass Code, Booking Date, Status, and Check-in Time.

### 5. Tamper-Proof QR Encryption (AES-256-GCM)
- QR payloads use 256-bit authenticated encryption so that pointing a personal smartphone camera at a pass won't leak raw attendee data or allow ticket counterfeiting.
- Only authorized EventPass verifiers can decrypt and validate the payload.

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL database pool & environment variables
│   │   ├── controllers/     # Controller logic (auth, events, passes, organizer, admin)
│   │   ├── middleware/      # JWT auth, role validation (organizer, admin)
│   │   ├── models/          # Database queries & models (User, Event, Pass)
│   │   ├── routes/          # REST API route definitions
│   │   ├── utils/           # Encryption (AES-256-GCM), CSV export helpers, seed script
│   │   ├── app.js           # Express application configuration & middleware
│   │   └── server.js        # Server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (Sidebar, Header, Navbar, PassQRModal)
│   │   ├── context/         # AuthContext (login, logout, role checks)
│   │   ├── layouts/         # MainLayout (responsive sidebar, persistent header, breadcrumbs)
│   │   ├── pages/           # Pages (public, auth, attendee, organizer, admin)
│   │   ├── services/        # Axios API clients for backend endpoints
│   │   ├── utils/           # Helper utilities (CSV export, classNames)
│   │   ├── App.jsx          # Route definitions & guards
│   │   └── main.jsx         # React DOM entry
│   ├── .env.example
│   ├── tailwind.config.js
│   └── package.json
│
└── docs/
    ├── API_DOCUMENTATION.md # Complete REST API reference with sample requests & responses
    ├── ARCHITECTURE.md      # Database schema, RBAC flow, pass lifecycle, and security model
    └── DEPLOYMENT.md        # Step-by-step production deployment guide
```

---

## Deployment on Render

This repository is ready for **1-click deployment on Render** (`https://render.com`) using the included [`render.yaml`](render.yaml) Blueprint:

1. Push your repository to GitHub.
2. In Render, click **New +** > **Blueprint**.
3. Select this repository and click **Apply**.
4. Render will automatically provision:
   - **`eventpass-db`**: Free managed PostgreSQL database.
   - **`eventpass-api`**: Node.js backend web service with auto-generated JWT secret and database connection.
   - **`eventpass-web`**: React Vite static frontend with SPA rewrites.
5. The backend automatically initializes tables and seeds demo users (`admin@shnoor.com`, `organizer@shnoor.com`, `attendee@shnoor.com` with password `password123`) on startup.

For manual deployment steps or single-service deployment, see the [Render Deployment Guide](docs/DEPLOYMENT.md).

---

## Documentation

More detailed documentation is available in the `docs/` directory:
- [API Documentation](docs/API_DOCUMENTATION.md) - Endpoints, request bodies, and responses.
- [Architecture & Design](docs/ARCHITECTURE.md) - Database relationships, RBAC, and security architecture.
- [Render Deployment Guide](docs/DEPLOYMENT.md) - Complete Render Blueprint & Monolith deployment guide.


---

## License

This project was developed for educational and evaluation purposes. Feel free to use and adapt it as needed.
