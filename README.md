# MediCore 3D

**Short Description:**  
Futuristic hospital operations, clinical workflow, and INR financial analytics web application featuring a 3D biomechatronic login canvas, installable mobile PWA support, and a live hospital telemetry assistant.

---

## Overview

**MediCore 3D** is a full-stack React + TypeScript + Express hospital management platform built for real-time ward monitoring, clinical coordination, pharmacy inventory tracking, and INR billing analytics.

### Key Features

- **3D Biomechatronic Login (`/login`)**: Full-bleed WebGL/Three.js animated medical robotics heart, gimbal rings, DNA helix, and 120-node ECG pulse with a responsive 2D SVG fallback and instant demo sign-in (`admin@medicore.demo` / `Demo@1234`).
- **Clinical & Operational Dashboard (`/dashboard/*`)**:
  - **Overview**: Hospital KPIs, payment timeline trends, and recent transaction feed.
  - **Patients**: Patient registry with status filtering (`Admitted`, `Critical`, `Outpatient`, `Discharged`), profile drawer, and registration modal.
  - **Doctors & Staff**: Specialist roster with live availability toggles (`Available`, `OPD Active`, `In Surgery`, `On Leave`).
  - **Appointments**: Visit booking and inline status management.
  - **Departments**: Ward bed capacity monitor with live occupancy adjustments and >=85% capacity alerts.
  - **Payments & Billing**: Multi-line itemized GST invoices (INR), partial/full payment recording (`UPI`, `Card`, `Insurance`, `Bank Transfer`, `Cash`), and printable receipts.
  - **Financial Analytics**: Multi-range cashflow (`Today` to `1 Year`) and payment method breakdown charts.
  - **Pharmacy & Inventory**: Batch tracking, expiry dates, reorder threshold alerts, and quick restocking.
  - **Reports & Settings**: One-click CSV exports and hospital/GST configuration.
- **MediCore Monitor AI Assistant**:
  - **On-Device Monitor**: Works immediately over live hospital store data for operational briefings, low-stock checks, pending invoices, ward loads, and app-only workflow guidance.
  - **Gemini Cloud AI**: Optional server-side proxy (`POST /api/assistant`) powered by `@google/genai` when a billing-enabled `GEMINI_API_KEY` is configured.
- **Installable PWA**: Configured with `vite-plugin-pwa`, Web App Manifest, adaptive/maskable PNG icons, offline indicator, and in-app install prompt for Android/iOS.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router, Motion, Recharts, Three.js / React Three Fiber
- **Backend**: Node.js, Express 4, `@google/genai`
- **PWA**: `vite-plugin-pwa` (Workbox service worker & offline caching)

---

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables (optional for Gemini Cloud AI)**
   Copy `.env.example` to `.env` and set `GEMINI_API_KEY` if you want to enable the **Gemini Cloud AI** mode inside the assistant drawer.

3. **Run in development**
   ```bash
   npm run dev
   ```
   Opens on `http://localhost:3000`.

4. **Type-check and production build**
   ```bash
   npm run lint
   npm run build
   npm start
   ```
