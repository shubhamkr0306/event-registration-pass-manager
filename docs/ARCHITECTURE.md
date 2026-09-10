# Project Architecture

The app is organized into two main folders: `frontend` and `backend`.

### Frontend (`/frontend`)
Built with React (Vite) and styled using Tailwind CSS.
- `src/pages/`: Pages for login/register, attendee pass list, organizer dashboard, scanner, and admin console.
- `src/components/`: Reusable components (navbar, sidebar, pass modal, QR camera scanner).
- `src/services/`: API utility and Axios requests to communicate with the backend.
- `src/context/`: Auth context that persists JWT token and current user in local storage.

### Backend (`/backend`)
Node.js server with Express and PostgreSQL.
- `src/controllers/`: Logic for handling auth, events, passes, verification, and admin actions.
- `src/middlewares/`: JWT verification and role checks (`ATTENDEE`, `ORGANIZER`, `ADMIN`).
- `src/routes/`: Route definitions connecting URLs to controllers.
- `src/config/`: Database pool and automatic schema setup on server start.

### Database Tables
- `users`: User information and role (`ATTENDEE`, `ORGANIZER`, `ADMIN`).
- `events`: Events created by organizers with venue, price, and capacity.
- `passes`: Booked passes linked to a user and event with QR data and check-in status (`ACTIVE`, `USED`, `CANCELLED`).
