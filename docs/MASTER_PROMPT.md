# MediFlow AI — Master Development, Security, Branding, and GitHub Synchronization Prompt

This document preserves the permanent master specification for **MediFlow AI** (AI-Powered Smart Doctor Appointment & Healthcare Management System).

---

## 1. Project Information
- **Project Name:** MediFlow AI
- **Full Title:** AI-Powered Smart Doctor Appointment & Healthcare Management System
- **Repository:** `https://github.com/vinaykumar-bille/Vinay_Kumar_pdd.git`
- **Target Branch:** `main`
- **Hardware Profile:** 8 GB RAM, Windows 11
- **Technology Stack:**
  - Web: React 18, Vite, Tailwind CSS
  - Mobile: React Native, Expo, TypeScript
  - Backend: Node.js, Express.js
  - AI Microservice: Python 3.11, FastAPI
  - Local AI: Ollama (`llama3.2:3b`)
  - Authentication: JWT, bcryptjs, RBAC
  - Database: MongoDB Atlas / Deterministic In-Memory Store

---

## 2. Core Directives & Mandates
1. **Never recreate the project from scratch.** Work directly on the existing repository.
2. **Security First:** Never trust client-supplied user IDs or roles. Enforce server-side ownership and role-based access control (RBAC).
3. **No Fake Fallbacks:** Remove fabricated client tokens (`mock_jwt_token`) and fabricated appointments (`status: 'Approved'`) when backend calls fail. Throw real, transparent error messages.
4. **Real Scheduling Integrity:** Prevent past appointments, validate doctor working days and leave dates, enforce double-booking prevention at the data store level.
5. **Unified MediFlow AI Branding:** Complete rebranding across web and mobile interfaces, eliminating all legacy names ("MediBook", "HealthNet").
6. **Cohesive Design System:**
   - Deep Trust Navy: `#15324F`
   - Health Clean Teal: `#087F8C`
   - Crisp White: `#FFFFFF`
   - Soft Muted Gray: `#F5F7F9`
   - Charcoal Text: `#202B36`
   - Rectangular buttons with 6–8px radius (`rounded-lg`), no pill-shaped buttons, no purple gradients, no emojis as interface icons.
7. **Legal Compliance:** Dedicated `/privacy-policy` and `/terms-and-conditions` covering medical disclaimers, HIPAA/GDPR alignment, patient data ownership, and telehealth consent.
8. **Multilingual AI Assistant:** Supports English, Telugu (తెలుగు), Tamil (தமிழ்), and Hindi (हिन्दी).
9. **Automated Verification:** All tests must pass cleanly before synchronizing with GitHub.
