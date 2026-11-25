# MediFlow AI — Changelog & Audit History

All notable technical changes, security remediations, branding updates, and architectural enhancements are documented in this file.

---

## [1.2.0] - 2026-11-25

### 🔐 Security & Authentication Repairs
- **Removed Fake Client JWT Tokens**:
  - `mobile/src/services/api.ts`: Removed client-side dummy token generation on login/registration failure. Now properly bubbles real server error messages.
  - `web/src/utils/api.js`: Eliminated `mock_jwt_token_sample_2026` generation in `apiRequest`.
  - `mobile/src/context/AuthContext.tsx`: Initialized `user` and `token` as `null` instead of pre-populating with mock identities.
- **Strict Password & Credential Verification**:
  - `backend/src/routes/authRoutes.js`: Required email and password on `/login`. Enforced `bcrypt.compare` against hashed credentials, eliminating fallback bypasses.
- **Role-Based Access Control (RBAC) & Ownership Validation**:
  - `backend/src/routes/appointmentRoutes.js`: Enforced `verifyAuth` and patient session binding (`req.user.id`). Restricted status changes to clinical staff (`RECEPTIONIST`, `DOCTOR`, `ADMIN`).
  - `backend/src/routes/prescriptionRoutes.js`: Restricted prescription creation to `DOCTOR` and `ADMIN` roles, bound to authenticated doctor identity. Added `GET /:id` with doctor/patient ownership checks.
  - `backend/src/routes/recordRoutes.js`: Protected patient medical records from cross-patient access on `GET /:patientId`, `POST /`, and `DELETE /:id`.
  - `backend/src/routes/patientRoutes.js`: Protected patient listings to staff only; restricted profile inspection and edits to record owner.

### 📅 Appointment Scheduling & Reliability
- **Doctor Working-Day & Leave Enforcement**:
  - Updated `backend/src/models/store.js` (`createAppointment` and `rescheduleAppointment`) and `appointmentRoutes.js` to validate requested dates against doctor working days and leaves.
- **Past-Date Prevention**:
  - Strictly rejected appointment bookings and rescheduling attempts with dates prior to current local date. Added `min={todayStr}` in date picker.
- **Removed Hardcoded Patient Identities**:
  - `web/src/pages/LandingPage.jsx`: Replaced fixed `usr_pat_1` with authenticated session user (`user.id`, `user.name`). Redirects unauthenticated users to `/login`.
  - `mobile/src/screens/BookingScreen.tsx`: Replaced fixed `usr_1` fallback with authenticated `user.id`.
- **Parameter Aliasing**:
  - Extended appointment routes to support both `date`/`appointmentDate` and `timeSlot`/`startTime` seamlessly across web and mobile clients.

### 🎨 Branding, UI Design System & Icon Assets
- **Unified MediFlow AI Branding**:
  - Rebranded all occurrences of "MediBook AI" and "HealthNet" across Web and Mobile UI components, headers, footers, notifications, and metadata.
  - Updated page titles in `web/index.html` ("MediFlow AI | Doctor Appointments") and `mobile/app.json`.
- **Production Icon Generation**:
  - Generated 1024x1024 mobile app icon (`mobile/assets/icon.png`), adaptive icon (`mobile/assets/adaptive-icon.png`), and splash screen (`mobile/assets/splash.png`).
  - Generated web favicons: `web/public/favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, and `apple-touch-icon.png` (180x180).
  - Designed with crisp white background, Teal cross (`#087F8C`), and Navy heartbeat ECG line (`#15324F`).
- **Cohesive Design Palette**:
  - Updated `web/tailwind.config.js` with Deep Trust Navy `#15324F`, Health Clean Teal `#087F8C`, Soft Muted Gray `#F5F7F9`, and Charcoal `#202B36`.
  - Converted buttons to rectangular shapes with 6–8px radius (`rounded-lg`), removed pill-shaped buttons and purple gradients.
- **Removed Fake Metrics & Content**:
  - `LandingPage.jsx`: Replaced arbitrary star ratings and fake review counts with verified clinical credentials and experience badges.
  - Implemented primary headline: **Find Doctors and Book Appointments Online**.
  - Implemented subtitle: **Search doctors by specialization and availability, schedule consultations, and manage appointments from one secure platform.**
  - Implemented clear CTAs: **Find a Doctor**, **View My Appointments**, **Sign In**, **Register**.

### ⚖️ Legal & Regulatory Compliance Pages
- **Web Legal Pages**:
  - Created `web/src/pages/PrivacyPolicy.jsx` (`/privacy-policy`) detailing HIPAA/GDPR alignment, encryption standards (TLS 1.3, AES-256), and patient data rights.
  - Created `web/src/pages/TermsAndConditions.jsx` (`/terms-and-conditions`) covering medical disclaimers, informed telehealth consent, and cancellation terms.
  - Linked legal pages from `web/src/components/Footer.jsx`.
- **Mobile Legal Modal**:
  - Added dedicated Legal & Compliance modal viewer accessible from `mobile/src/screens/ProfileScreen.tsx`.

### 🌐 Multilingual AI Healthcare Assistant
- **Multilingual Support**:
  - Supported languages: **English**, **Telugu (తెలుగు)**, **Tamil (தமிழ்)**, and **Hindi (हिन्दी)**.
  - Added language selector dropdown in `web/src/components/HealthcareChat.jsx` and chips in `mobile/src/screens/AIAssistantScreen.tsx`.
  - Updated `ai-service/app/main.py` and `ollama_service.py` with language-specific directives while preserving English clinical terminology.
  - Updated `backend/src/routes/aiRoutes.js` and `aiService.js` to forward language parameters.

### 🧪 Automated Verification
- Expanded backend automated tests to 24 tests covering role authorization, working-day validation, password security, and record retrieval.
- Maintained 13 Python AI & Ollama tests verifying emergency triage, model queries, fallback resilience, and prompt safety guardrails.
- Verified web frontend production build (`npm run build:web`).
- Verified mobile TypeScript compilation (`npx tsc --noEmit`).
