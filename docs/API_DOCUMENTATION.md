# EventPass API Documentation

This document covers all the REST API endpoints available in the EventPass backend, including query parameters, request bodies, authentication headers, and example responses.

**Base URL**: `http://localhost:5000/api/v1`

---

## Table of Contents

1. [Authentication & Headers](#authentication--headers)
2. [Health Check](#health-check)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Public Event Endpoints](#public-event-endpoints)
5. [Attendee Pass Endpoints](#attendee-pass-endpoints)
6. [Pass Verification & Gate Check-In](#pass-verification--gate-check-in)
7. [Organizer Endpoints](#organizer-endpoints)
8. [Admin Endpoints](#admin-endpoints)

---

## Authentication & Headers

Protected endpoints require a valid JWT token passed in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## Health Check

### `GET /health`
Returns the operational health status of the backend service.

**Response `(200 OK)`**:
```json
{
  "status": "ok",
  "timestamp": "2026-09-09T11:45:00.000Z"
}
```

---

## Authentication Endpoints

### 1. Register a New User
`POST /auth/register`

Creates a new user account. Default role is `ATTENDEE`.

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "ATTENDEE"
}
```

**Response `(201 Created)`**:
```json
{
  "success": true,
  "message": "User registered successfully.",
  "user": {
    "id": 5,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "ATTENDEE"
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 2. Login
`POST /auth/login`

Authenticates credentials and returns a signed JWT token.

**Request Body**:
```json
{
  "email": "organizer@shnoor.com",
  "password": "password123"
}
```

**Response `(200 OK)`**:
```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": 2,
    "name": "Shubham Kumar",
    "email": "organizer@shnoor.com",
    "role": "ORGANIZER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 3. Get Current User Profile
`GET /auth/me` *(Protected)*

Fetches the currently authenticated user's details from the token.

**Response `(200 OK)`**:
```json
{
  "success": true,
  "user": {
    "id": 2,
    "name": "Shubham Kumar",
    "email": "organizer@shnoor.com",
    "role": "ORGANIZER",
    "created_at": "2026-09-01T08:00:00.000Z"
  }
}
```

---

## Public Event Endpoints

### 1. List Public Events
`GET /events`

Returns a list of upcoming active events. Supports search and category filtering.

**Query Parameters**:
- `search` *(optional)*: Search keyword matching title, description, or location.
- `category` *(optional)*: Filter by event category (`Technology`, `Workshop`, `Conference`, `Meetup`, etc.).
- `limit` *(optional, default: 50)*: Number of items per page.

**Response `(200 OK)`**:
```json
{
  "success": true,
  "count": 4,
  "events": [
    {
      "id": 1,
      "title": "Global AI & Cloud Summit 2026",
      "description": "Annual summit gathering cloud architects and AI engineers.",
      "category": "Technology",
      "date": "2026-09-16T09:00:00.000Z",
      "location": "Bangalore, India",
      "venue": "Grand Tech Convention Centre, Hall A",
      "ticket_price": "499.00",
      "total_capacity": 200,
      "registered_count": 144,
      "available_seats": 56,
      "status": "ACTIVE",
      "organizer_name": "Shubham Kumar"
    }
  ]
}
```

---

### 2. Get Event Details
`GET /events/:id`

Returns full details for a single event, including real-time capacity and availability.

**Response `(200 OK)`**:
```json
{
  "success": true,
  "event": {
    "id": 1,
    "title": "Global AI & Cloud Summit 2026",
    "description": "Annual summit gathering cloud architects and AI engineers.",
    "category": "Technology",
    "date": "2026-09-16T09:00:00.000Z",
    "location": "Bangalore, India",
    "venue": "Grand Tech Convention Centre, Hall A",
    "ticket_price": "499.00",
    "total_capacity": 200,
    "registered_count": 144,
    "available_seats": 56,
    "status": "ACTIVE",
    "organizer_name": "Shubham Kumar",
    "organizer_email": "organizer@shnoor.com"
  }
}
```

---

## Attendee Pass Endpoints

### 1. Book an Event Pass
`POST /passes/book` *(Protected - Attendee)*

Registers the authenticated user for an event and generates a unique pass.

**Request Body**:
```json
{
  "eventId": 1
}
```

**Response `(201 Created)`**:
```json
{
  "success": true,
  "message": "Pass booked successfully for \"Global AI & Cloud Summit 2026\"!",
  "pass": {
    "id": 42,
    "event_id": 1,
    "user_id": 4,
    "pass_code": "PASS-M8X9K2L1-77P4",
    "status": "ACTIVE",
    "created_at": "2026-09-09T11:48:00.000Z",
    "qr_token": "EPASS_7f8a9b0c1d2e_e8a7c6b5d4..._a1b2c3d4"
  }
}
```

**Error Responses**:
- `400 Bad Request`: When the event has reached full capacity (`"This event is sold out."`).
- `409 Conflict`: When the user is already registered for this event (`"You already have an active pass for this event."`).

---

### 2. Get My Passes
`GET /passes/my-passes` *(Protected - Attendee)*

Returns all passes booked by the authenticated user with event details.

**Response `(200 OK)`**:
```json
{
  "success": true,
  "count": 2,
  "passes": [
    {
      "id": 42,
      "pass_code": "PASS-M8X9K2L1-77P4",
      "status": "ACTIVE",
      "event_title": "Global AI & Cloud Summit 2026",
      "event_date": "2026-09-16T09:00:00.000Z",
      "venue": "Grand Tech Convention Centre",
      "location": "Bangalore, India",
      "ticket_price": "499.00",
      "qr_token": "EPASS_...",
      "checked_in_at": null
    }
  ]
}
```

---

### 3. Cancel a Pass
`DELETE /passes/:id` *(Protected - Attendee)*

Cancels a booked pass and frees up the seat capacity.

**Response `(200 OK)`**:
```json
{
  "success": true,
  "message": "Pass cancelled successfully."
}
```

---

## Pass Verification & Gate Check-In

### 1. Verify a Digital Pass
`POST /passes/verify` *(Protected - Organizer or Admin)*

Validates a pass presented at the event gate. Accepts either an encrypted QR token (`EPASS_...`) or a plain pass code (`PASS-XXXX-XXXX`).

**Request Body**:
```json
{
  "passCode": "PASS-M8X9K2L1-77P4"
}
```
*(or with an encrypted token payload)*:
```json
{
  "passCode": "EPASS_7f8a9b0c1d2e_e8a7c6b5d4..._a1b2c3d4"
}
```

**Response `(200 OK - Valid Pass)`**:
```json
{
  "success": true,
  "valid": true,
  "status": "ACTIVE",
  "message": "Pass Verified! Attendee is officially registered for this event.",
  "pass": {
    "id": 42,
    "pass_code": "PASS-M8X9K2L1-77P4",
    "status": "ACTIVE",
    "attendee_name": "Jane Doe",
    "attendee_email": "jane@example.com",
    "event_title": "Global AI & Cloud Summit 2026",
    "event_date": "2026-09-16T09:00:00.000Z",
    "venue": "Grand Tech Convention Centre, Hall A",
    "location": "Bangalore, India"
  }
}
```

**Response `(200 OK - Already Used Pass)`**:
```json
{
  "success": true,
  "valid": false,
  "status": "USED",
  "message": "Notice: This pass has already been used / checked in at the venue.",
  "pass": {
    "id": 42,
    "pass_code": "PASS-M8X9K2L1-77P4",
    "status": "USED",
    "checked_in_at": "2026-09-09T10:15:30.000Z"
  }
}
```

---

### 2. Check-In / Admit Attendee
`PATCH /passes/:id/check-in` *(Protected - Organizer or Admin)*

Marks the pass as `USED` and records the check-in timestamp. Prevents duplicate admissions.

**Response `(200 OK)`**:
```json
{
  "success": true,
  "message": "Check-in successful! Attendee with pass PASS-M8X9K2L1-77P4 has been admitted.",
  "pass": {
    "id": 42,
    "status": "USED",
    "checked_in_at": "2026-09-09T11:50:22.000Z"
  }
}
```

---

## Organizer Endpoints

All organizer endpoints require a valid JWT token with role `ORGANIZER`.

### 1. Get Organizer Dashboard Stats
`GET /organizer/stats`

Returns aggregated metrics for the logged-in organizer's hosted events.

**Response `(200 OK)`**:
```json
{
  "success": true,
  "stats": {
    "totalEvents": 4,
    "totalRegistrations": 299,
    "totalCapacity": 500,
    "activeEvents": 4,
    "fillRate": 60,
    "totalRevenue": 91789
  }
}
```

---

### 2. List Hosted Events
`GET /organizer/events`

Returns all events created by the logged-in organizer with real-time capacity and revenue stats.

---

### 3. Create a New Event
`POST /organizer/events`

Creates an event hosted by the organizer.

**Request Body**:
```json
{
  "title": "Next-Gen React & Vite Masterclass",
  "description": "Deep dive into performance optimizations and modern web architecture.",
  "category": "Technology",
  "date": "2026-10-05T10:00:00.000Z",
  "location": "Hyderabad, India",
  "venue": "T-Hub Phase 2, Auditorium",
  "ticket_price": 299,
  "total_capacity": 150
}
```

---

### 4. Get Attendee List (CSV-Ready)
`GET /organizer/attendees`

Fetches all registered attendees across the organizer's hosted events, with optional status and search filters. Used for live search and CSV export.

---

### 5. Get Event Analytics
`GET /organizer/analytics`

Returns turnout rates, attendance percentages, and revenue breakdowns per event.

---

## Admin Endpoints

All admin endpoints require a valid JWT token with role `ADMIN`.

### 1. System Overview Statistics
`GET /admin/stats`

Returns platform-wide user counts, role breakdowns, database status, and server uptime.

**Response `(200 OK)`**:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 18,
    "attendees": 14,
    "organizers": 3,
    "admins": 1,
    "dbStatus": "CONNECTED",
    "serverUptime": "45m"
  }
}
```

---

### 2. User Management
- `GET /admin/users`: List all platform users with role filter and search.
- `PUT /admin/users/:id/role`: Update a user's role (`ATTENDEE`, `ORGANIZER`, `ADMIN`).
- `DELETE /admin/users/:id`: Delete a user account.

---

### 3. All Attendees & Check-In Oversight
`GET /admin/attendees`

Lists all attendees across every event on the platform. Supports check-in oversight and CSV export.

---

### 4. Platform-Wide Analytics
`GET /admin/analytics`

Aggregates platform-wide capacity fill, total registrations, active vs used passes, and gross platform revenue.
