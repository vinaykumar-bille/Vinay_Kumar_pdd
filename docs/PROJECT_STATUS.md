# MediFlow AI — Project Status & Architectural Overview

Current operational and deployment status for **MediFlow AI — AI-Powered Smart Doctor Appointment & Healthcare Management System**.

---

## 1. System Health & Verification Summary

| Subsystem | Status | Verification Command | Result |
|---|---|---|---|
| **Backend API** | Ready | `npm run test:backend` | **24 Passed, 0 Failed** |
| **Python AI Service** | Ready | `npm run test:ai` | **13 Passed, 0 Failed** |
| **Combined Test Suite** | Ready | `npm test` | **37 Passed, 0 Failed** |
| **Web Frontend Build** | Ready | `npm run build:web` | **Built in 10.2s, 0 errors** |
| **Mobile TypeScript** | Ready | `cd mobile && npx tsc --noEmit` | **Clean, 0 errors** |
| **Ollama Local LLM** | Ready | Integrated (`llama3.2:3b`) with clinical fallback | **Operational** |

---

## 2. API Endpoints Reference

### Authentication & User Management (`/api/auth`)
- `POST /api/auth/register` — Create new patient account with bcrypt salted hash.
- `POST /api/auth/login` — Authenticate credentials, verify role, issue signed JWT.
- `GET /api/auth/me` — Retrieve active session profile.
- `POST /api/auth/logout` — Invalidate client session.

### Doctor & Availability (`/api/doctors`)
- `GET /api/doctors` — Query doctors by department, specialization, clinic, or consultation mode.
- `GET /api/doctors/:id` — Retrieve full doctor clinical profile.
- `GET /api/doctors/:id/availability?date=YYYY-MM-DD` — Compute real-time available time slots based on working days, leaves, and booked appointments.
- `GET /api/doctors/specializations` — List available clinical specialties with doctor counts.

### Appointments (`/api/appointments`)
- `GET /api/appointments` — Role-partitioned appointment list (Patients see own; Doctors see assigned roster).
- `GET /api/appointments/:id` — Single appointment details with ownership check.
- `POST /api/appointments` — Concurrency-safe atomic slot reservation bound to authenticated session.
- `PATCH /api/appointments/:id/reschedule` — Reschedule consultation with audit trail.
- `PATCH /api/appointments/:id/cancel` — Cancel consultation with recorded reason.
- `PATCH /api/appointments/:id/status` — Staff status update (`CHECKED_IN`, `IN_CONSULTATION`, `COMPLETED`).

### Prescriptions & Records (`/api/prescriptions`, `/api/records`)
- `GET /api/prescriptions` — List patient or doctor prescriptions.
- `POST /api/prescriptions` — Doctor-only digital prescription generation.
- `GET /api/records/:patientId` — Retrieve uploaded patient lab reports and images.
- `POST /api/records` — Upload diagnostic document bound to patient identity.
- `DELETE /api/records/:id` — Remove record with ownership verification.

### AI Intelligence Microservice (`/api/ai`)
- `POST /api/ai/chat` — Multilingual healthcare assistant powered by Ollama with critical red-flag emergency override.
- `GET /api/ai/ollama/status` — Real-time Ollama daemon and model diagnostic status.
- `POST /api/ai/specialty-guidance` — Clinical symptom-to-specialty triage NLP.
- `POST /api/ai/recommend-doctors` — Multi-attribute doctor recommendation engine.
- `GET /api/ai/appointment-forecast` — 7-day operational appointment demand projection.

---

## 3. Seed User Accounts & Demonstration Credentials

All pre-seeded test accounts use the password: `Password@123`

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Patient** | `vinay@gmail.com` | `Password@123` | Search doctors, book slots, chat with AI assistant, view prescriptions |
| **Doctor** | `amit.verma@saveethamedicalcollege.com` | `Password@123` | Manage clinical schedule, conduct video consults, write prescriptions |
| **Receptionist** | `reception@saveethahospital.com` | `Password@123` | Live check-in desk, waiting queue, walk-in appointment registration |
| **Admin** | `admin@gmail.com` | `Password@123` | Hospital analytics, doctor registry CRUD, system audit logs |

---

## 4. Git Repository & Remote Status
- **Remote URL:** `https://github.com/vinaykumar-bille/Vinay_Kumar_pdd.git`
- **Active Branch:** `main`
- **CI Workflow:** GitHub Actions `.github/workflows/ci.yml` running Node.js + Python tests, Web build, and Mobile typecheck.
