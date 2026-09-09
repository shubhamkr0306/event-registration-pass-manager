# EventPass Production Deployment Guide (Render)

This guide walks through deploying the EventPass application to **Render** (`https://render.com`).

The repository is pre-configured with a **Render Blueprint (`render.yaml`)**, cloud-ready database connection pooling, auto-migration/auto-seeding on fresh databases, and automatic CORS configuration for `*.onrender.com` domains.

---

## Deployment Options on Render

You can deploy EventPass to Render using either of two simple approaches:

| Approach | Best For | Description |
| :--- | :--- | :--- |
| **Method 1: Render Blueprint (`render.yaml`)** *(Recommended)* | Clean multi-service architecture | Provisions a managed PostgreSQL database, backend web service, and frontend static site with automatic environment variable wiring. |
| **Method 2: Single Render Web Service** | Simple single-URL deployment | Deploys backend and frontend together on a single Render free web service. Express serves the React build from `frontend/dist`. |

---

## Method 1: Deploy with Render Blueprint (`render.yaml`)

This repository includes a [`render.yaml`](../render.yaml) file in the root directory that defines the database, API, and static frontend.

### Step-by-Step Instructions:

1. **Push your code to GitHub**:
   Ensure your latest commits are pushed to your GitHub repository.

2. **Open Render Dashboard**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click the **New +** button in the top navigation bar.
   - Select **Blueprint**.

3. **Connect Your Repository**:
   - Connect your GitHub account and select your `event-registration-pass-manager` repository.
   - Branch: `main` (or your active branch).

4. **Review & Apply**:
   - Render will parse `render.yaml` and show the resources it will create:
     - 🗄️ **`eventpass-db`** (Render PostgreSQL Database - Free tier)
     - ⚙️ **`eventpass-api`** (Backend Web Service - Node.js)
     - 🌐 **`eventpass-web`** (Frontend Static Site - React 18 + Vite)
   - Click **Apply**.

5. **Automatic Setup & Auto-Seeding**:
   - Render will build and deploy all three resources.
   - On first launch, the backend automatically connects to the PostgreSQL database, creates the required tables (`users`, `events`, `passes`), and seeds the demo accounts (`admin@shnoor.com`, `organizer@shnoor.com`, `attendee@shnoor.com`).
   - Once the build finishes, open your `eventpass-web.onrender.com` URL in your browser!

---

## Method 2: Deploy as a Single Web Service (Monolith)

If you prefer having a single URL on Render's free tier that serves both the API and the React frontend:

1. **Create a PostgreSQL Database on Render**:
   - Click **New +** > **PostgreSQL**.
   - Name: `shnoor-event-db`
   - Database: `shnoor_event_db`
   - User: `shnoor_user`
   - Plan: **Free**
   - Click **Create Database**.
   - Copy the **Internal Database URL** (or External Database URL).

2. **Create the Web Service on Render**:
   - Click **New +** > **Web Service**.
   - Select your repository.
   - Configure the service settings:
     - **Name**: `eventpass`
     - **Runtime**: `Node`
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Plan**: `Free`

3. **Add Environment Variables**:
   In the **Environment Variables** section, add:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = *(Paste the PostgreSQL connection URL from Step 1)*
   - `JWT_SECRET` = *(Any random string, e.g. `super_secret_jwt_key_2026_xyz`)*
   - `JWT_EXPIRES_IN` = `7d`

4. **Click Deploy Web Service**:
   - Render will install dependencies, build the frontend bundle into `frontend/dist`, connect to PostgreSQL, and start the server.
   - Your application will be live at `https://your-service-name.onrender.com` with both frontend and backend running on the same domain.

---

## Pre-Configured Cloud Features

1. **Automatic Database Connection & SSL**:
   The PostgreSQL client in [`backend/src/config/db.js`](../backend/src/config/db.js) automatically detects `DATABASE_URL` and enables SSL mode (`rejectUnauthorized: false`) for Render, Neon, and cloud databases.

2. **Zero-Configuration Auto-Seeding**:
   When the backend starts against a fresh database, it automatically seeds:
   - **Admin**: `admin@shnoor.com` / `password123`
   - **Organizer**: `organizer@shnoor.com` / `password123`
   - **Attendee**: `attendee@shnoor.com` / `password123`
   - 4 upcoming active/upcoming events.

3. **Wildcard Cloud CORS**:
   [`backend/src/app.js`](../backend/src/app.js) automatically allows any origin ending with `.onrender.com` or `.vercel.app`, preventing CORS errors even if domains change.

4. **HTTPS Camera Access**:
   Render automatically provisions free SSL/TLS certificates (HTTPS) for all domains, ensuring that the **Live Camera QR Scanner** (`navigator.mediaDevices.getUserMedia`) works properly on smartphones and laptops.

5. **Client-Side SPA Routing**:
   Both [`render.yaml`](../render.yaml) and [`frontend/vercel.json`](../frontend/vercel.json) include single-page application URL rewriting (`/*` → `/index.html`), preventing 404 errors when refreshing `/dashboard` or `/events`.

---

## Post-Deployment Smoke Test Checklist

- [ ] **Health Endpoint**: `curl https://<your-backend>.onrender.com/api/v1/health` returns `{"status":"ok",...}`.
- [ ] **Attendee Login**: Sign in with `attendee@shnoor.com` / `password123` and browse events.
- [ ] **Pass Booking**: Book a pass and test the **View QR** modal and **Download QR** button.
- [ ] **Organizer Login**: Sign in with `organizer@shnoor.com` / `password123` and view the dashboard metrics.
- [ ] **Live Camera Scanner**: Test camera pass scanning on `/dashboard/scanner`.
- [ ] **CSV Export**: Verify participant list download on `/dashboard/attendees`.
- [ ] **Admin Console**: Sign in with `admin@shnoor.com` / `password123` and inspect user management on `/admin`.
