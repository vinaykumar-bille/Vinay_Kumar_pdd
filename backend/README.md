# MediBook AI — Backend API & Clinical Engine

The backend provides a RESTful clinical API server built with **Node.js**, **Express.js**, **CORS**, and optional MongoDB Atlas / Supabase persistence with a high-fidelity in-memory fallback store for instant zero-config demonstration.

---

## 🛠️ Key Features
- **Smart Roster & Overlap Prevention**: Restricts slot selections if another patient has already secured that doctor on the specified date/time.
- **Role-Based Authentication**: Secure JWT-based access for `PATIENT`, `DOCTOR`, `RECEPTIONIST`, and `ADMIN`.
- **Receptionist Queue Flow**: Check-in, waiting queue status, and no-show marking.
- **EHR & Medical Records Management**: Document uploads, blood reports, and radiology scans.
- **Digital Prescription Generator**: Diagnosis charts, posology dosages (`1-0-1`), and printable clinical receipts.
- **Audit Logging**: Immutable timestamped tracking of all system modifications.
- **Analytics Aggregator**: Real-time KPI counters, departmental physician distribution, and appointment volume tracking.

---

## 📁 Directory Structure
```
backend/
├── src/
│   ├── config/          # Database & environment configurations
│   ├── middleware/      # JWT auth, error handlers, and role gates
│   ├── models/          # Schema definitions and high-fidelity data store
│   ├── routes/          # Express route controllers
│   ├── seed/            # Pre-seeded clinical hospital records
│   └── services/        # AI proxy and analytics computation
├── tests/
│   └── api.test.js      # Automated verification test suite
├── server.js            # Main Express application entry point
└── package.json
```

---

## 🚀 Running the Backend

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm start
```
*API Base URL*: `http://localhost:5000/api`

### Run Automated Tests
```bash
npm test
```
*(Runs 12 unit and integration verification tests covering seed data, availability calculation, booking, rescheduling, and prescriptions)*
