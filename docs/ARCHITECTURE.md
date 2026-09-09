# EventPass Architecture & Design Document

This document outlines the technical architecture, data model, security design, and lifecycle workflows behind the EventPass platform.

---

## 1. High-Level System Architecture

EventPass is designed as a decoupled, three-tier web application:

```
[ Client Layer (React 18 + Vite SPA) ]
                  │
                  ▼  HTTP / REST (JSON + JWT)
[ Application Layer (Node.js + Express.js API) ]
                  │
                  ▼  SQL Connection Pool (pg)
[ Persistence Layer (PostgreSQL Database) ]
```

- **Frontend**: Single-page application built with React, Vite, and Tailwind CSS. State is managed via React Context (`AuthContext`) and local component state.
- **Backend**: RESTful API server powered by Express.js. Implements stateless JWT authentication, role guards, and clean controller-service separation.
- **Database**: Relational PostgreSQL database storing user identities, event details, and pass registrations with foreign key integrity.

---

## 2. Database Schema & Entity Relationships

The relational model uses three core entities: **Users**, **Events**, and **Passes**.

```
┌─────────────────────────────────┐
│              USERS              │
├─────────────────────────────────┤
│ id (PK)                         │
│ name VARCHAR(255)               │
│ email VARCHAR(255) UNIQUE       │
│ password VARCHAR(255)           │
│ role ('ATTENDEE'|'ORGANIZER'|   │
│       'ADMIN')                  │
│ created_at TIMESTAMP            │
└────────────────┬────────────────┘
                 │ 1
                 │
                 │ has many
                 ▼ N
┌─────────────────────────────────┐          ┌─────────────────────────────────┐
│             EVENTS              │          │             PASSES              │
├─────────────────────────────────┤          ├─────────────────────────────────┤
│ id (PK)                         │ 1      N │ id (PK)                         │
│ organizer_id (FK -> users.id)   ├─────────►│ event_id (FK -> events.id)     │
│ title VARCHAR(255)              │          │ user_id (FK -> users.id)        │
│ description TEXT                │          │ pass_code VARCHAR(64) UNIQUE    │
│ category VARCHAR(100)           │          │ status ('ACTIVE'|'USED'|        │
│ date TIMESTAMP                  │          │         'CANCELLED')            │
│ location VARCHAR(255)           │          │ checked_in_at TIMESTAMP         │
│ venue VARCHAR(255)              │          │ created_at TIMESTAMP            │
│ ticket_price NUMERIC(10,2)      │          └─────────────────────────────────┘
│ total_capacity INT              │
│ status ('ACTIVE'|'CANCELLED')   │
│ created_at TIMESTAMP            │
└─────────────────────────────────┘
```

### Key Relational Constraints:
1. **Organizer -> Events**: An event belongs to exactly one organizer (`organizer_id` references `users.id` with `ON DELETE CASCADE`).
2. **Event & Attendee -> Passes**: Each pass records an attendee's registration for an event.
3. **Duplicate Prevention**: A unique composite constraint ensures that a user cannot register multiple active passes for the same event.
4. **Capacity Enforcement**: When booking, transactions verify `registered_count < total_capacity` before issuing a pass.

---

## 3. Pass Generation & Cryptographic Verification

A core goal of EventPass is to provide verifiable, tamper-proof digital passes that can be validated at the door.

### Pass Code Structure
Each pass receives a human-readable, unique code:
```
PASS-[RANDOM_8_CHARS]-[CHECKSUM_4_CHARS]
Example: PASS-MTMX45LI-BZ0N
```

### Tamper-Proof QR Encryption (AES-256-GCM)
Raw JSON payloads inside a QR code are vulnerable:
- Anyone scanning with a phone camera can view personal attendee data.
- Fraudulent attendees can forge plaintext JSON tickets.

To prevent this, EventPass uses authenticated symmetric encryption (**AES-256-GCM**):
1. **Payload**:
   ```json
   {
     "code": "PASS-MTMX45LI-BZ0N",
     "eventId": 1,
     "userId": 4,
     "issuedAt": "2026-09-09T11:45:00.000Z"
   }
   ```
2. **Encryption**:
   - The backend generates a cryptographically secure 12-byte initialization vector (`IV`) for each pass.
   - Encrypts the payload with the server's master secret key using AES-256-GCM.
   - Produces a 16-byte authentication tag that detects any tampering or bit-flipping.
3. **Output Token**:
   ```
   EPASS_<iv_hex>_<ciphertext_hex>_<authTag_hex>
   ```
4. **Scanning & Admission**:
   - When scanned by the organizer's camera, the token is sent to `/api/v1/passes/verify`.
   - The backend validates the authentication tag, decrypts the payload, and looks up the pass in PostgreSQL.
   - If valid, the gatekeeper clicks **Admit Attendee**, transitioning the status from `ACTIVE` to `USED` and timestamping `checked_in_at`.
   - Re-scanning an admitted pass immediately returns `USED` with the original admission time, preventing ticket reuse or sharing.

---

## 4. Role-Based Access Control (RBAC) Architecture

Authentication and authorization operate across both backend middleware and frontend route guards.

### Backend Middleware Stack:
1. **`protect` Middleware**:
   - Extracts the Bearer token from the `Authorization` header.
   - Verifies the signature with `jwt.verify(token, JWT_SECRET)`.
   - Queries PostgreSQL for the user record and attaches it to `req.user`.
2. **`organizerOnly` Middleware**:
   - Validates that `req.user.role === 'ORGANIZER'`. Rejects other users with `403 Forbidden`.
3. **`adminOnly` Middleware**:
   - Validates that `req.user.role === 'ADMIN'`. Rejects other users with `403 Forbidden`.
4. **`organizerOrAdmin` Middleware**:
   - Allows either Organizers or Admins to verify passes and check in attendees.

### Frontend Route Guards:
- **`OrganizerRoute`**: Checks `AuthContext`. If user is not an Organizer, redirects to `/login` or `/`.
- **`AdminRoute`**: Checks `AuthContext`. If user is not an Admin, redirects to `/login` or `/`.

---

## 5. Unified Frontend Layout Design

Earlier iterations of the application used separate layouts for the public site and the organizer dashboard (`DashboardLayout` vs `MainLayout`), which caused jarring UI shifts, duplicate headers, and confusing redirects.

### Consolidated Single-Layout Architecture:
All application pages now render inside a unified, responsive shell ([`MainLayout.jsx`](file:///c:/Users/golu7/Downloads/Assignments/Shnoor/frontend/src/layouts/MainLayout.jsx)):

```
┌────────────────────────────────────────────────────────────────────────┐
│  AppSidebar (Left)        │  AppHeader (Top Bar: Breadcrumbs + Profile)│
│  ──────────────────────── │  ──────────────────────────────────────────│
│  • Role-Aware Links       │                                            │
│  • Expand / Collapse      │  Page Content Outlet (<main>)              │
│  • Brand Logo Link        │                                            │
│                           │  Footer (Bottom)                           │
└───────────────────────────┴────────────────────────────────────────────┘
```

### Benefits of the Unified Layout:
1. **Zero Disorientation**: Navigating from Organizer Overview to Explore Events or Live QR Scanner keeps the exact same sidebar and top bar.
2. **Smart Redirects**: If an Organizer visits `/`, the route automatically directs them to `/dashboard`. If an Admin visits `/`, they land on `/admin`.
3. **Persistent Profile Management**: User avatar, role badge, and Sign Out are unified in the top-right header, eliminating duplicate buttons.
4. **Responsive Mobile Drawer**: On small screens, the sidebar slides in smoothly as a mobile drawer with backdrop blur, while keeping full desktop usability.
