# MediFlow AI — AI-Powered Smart Doctor Appointment & Healthcare Management System

[![CI Pipeline](https://github.com/vinaykumar-bille/Vinay_Kumar_pdd/actions/workflows/ci.yml/badge.svg)](https://github.com/vinaykumar-bille/Vinay_Kumar_pdd/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20FastAPI%20%7C%20Expo-15324F.svg)](#technology-stack)

**MediFlow AI** is a full-stack, enterprise-grade clinical management and patient scheduling platform built for hospitals, clinics, physicians, and patients. It seamlessly synchronizes a responsive **React Vite Web Portal** and a cross-platform **Expo React Native Mobile Application** with a robust **Node.js Express Backend** and an **Ollama-Powered Python FastAPI AI Microservice**.

---

## 🏥 Key Capabilities

### 1. Doctor Discovery & Real-Time Scheduling
- **Search & Filters**: Search doctors by specialization, clinical department, consultation fee, or consultation mode (In-Person clinic visit vs. HD Telehealth video consultation).
- **Atomic Double-Booking Prevention**: Real-time slot locking checks doctor working days, leave dates, and active appointments, systematically preventing concurrent double-bookings.
- **Dynamic Slot Calendars**: Automatically computes available time slots for the current date and upcoming days.

### 2. Ollama Local LLM & Multilingual AI Healthcare Assistant
- **Local AI Inference**: Powered by **Ollama (`llama3.2:3b`)** running locally with complete privacy and zero data leakage.
- **Multilingual Support**: Real-time language adaptation in **English**, **Telugu (తెలుగు)**, **Tamil (தமிழ்)**, and **Hindi (हिन्दी)**.
- **Deterministic Emergency Red-Flag Interceptor**: Life-threatening symptoms (crushing chest pain, slurred speech, sudden paralysis) bypass the LLM and instantly trigger acute emergency alerts with emergency hotline buttons (108 / 112).
- **Dual-Tier Fallback Resilience**: Seamless fallback to high-fidelity clinical decision rule engine if Ollama is offline or warming up.

### 3. Role-Based Access Control & Security
- **Strict Role Isolation**: Distinct portals and permissions for **PATIENT**, **DOCTOR**, **RECEPTIONIST**, and **ADMIN**.
- **Session Identity Enforcement**: Appointments and medical records are strictly bound to authenticated server-side sessions.
- **Data Privacy & Ownership**: Patients can view, download, or delete their discretionary uploaded health records.
- **Audit Trails**: Full audit logging across doctor additions, status updates, rescheduling, cancellations, and prescription issuance.

### 4. Interactive Clinical Workflows
- **Digital Prescriptions**: Doctors formulate official diagnoses, symptom reviews, and medication schedules with posology regimens (`1-0-1`).
- **Encrypted Telehealth Consultations**: Integrated WebRTC video room for remote doctor-patient appointments.
- **Receptionist Desk Queue**: Live queue monitoring, walk-in patient registration, and instant check-ins.
- **Administrative Analytics**: Hospital metrics, 7-day demand projections, and CSV appointment export.

### 5. Legal & Regulatory Compliance
- **Privacy Policy (`/privacy-policy`)**: Detailed HIPAA and GDPR alignment, encryption standards (TLS 1.3, AES-256), and patient data rights.
- **Terms and Conditions (`/terms-and-conditions`)**: Explicit medical disclaimers, informed telehealth consent, and cancellation policies.

---

## 🎨 Design System

MediFlow AI follows a cohesive, professional clinical design:
- **Deep Trust Navy**: `#15324F`
- **Health Clean Teal**: `#087F8C`
- **Crisp White**: `#FFFFFF`
- **Soft Muted Gray**: `#F5F7F9`
- **Charcoal Text**: `#202B36`
- **Button Radii**: Rectangular with 6–8px border radius (`rounded-lg`), WCAG AA compliant contrast.
- **Icons**: Production-ready 1024x1024 mobile icons (`mobile/assets/icon.png`, `adaptive-icon.png`, `splash.png`) and web favicons (`web/public/favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, `apple-touch-icon.png`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Web Portal** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6 |
| **Mobile App** | React Native, Expo, TypeScript, React Navigation |
| **Backend API** | Node.js, Express.js, JWT, bcryptjs, Express Rate Limit |
| **AI Microservice**| Python 3.11, FastAPI, Uvicorn, Pydantic |
| **Local LLM** | Ollama, Llama 3.2:3b |
| **Database** | MongoDB Atlas / Local Store Engine with atomic constraints |
| **CI / CD** | GitHub Actions (`.github/workflows/ci.yml`) |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (Version >= 18.0.0)
- [Python 3.10+](https://www.python.org/)
- [Ollama](https://ollama.com/) (Optional, for local AI model inference)

### 1. Installation
Clone the repository and install all workspace dependencies:
```bash
git clone https://github.com/vinaykumar-bille/Vinay_Kumar_pdd.git
cd "VINAY APP"
npm run setup
```

### 2. Configure Environment Variables
Copy the provided environment templates:
```bash
# Backend
cp backend/.env.example backend/.env

# AI Microservice
cp ai-service/.env.example ai-service/.env
```

### 3. Launch Services
Run the full-stack system concurrently:
```bash
# Web + Backend + Python AI Microservice
npm run dev:all
```

Service endpoints:
- **Web Application**: [http://localhost:3000](http://localhost:3000)
- **Node.js Backend API**: [http://localhost:5000](http://localhost:5000)
- **Python FastAPI Service**: [http://localhost:8000](http://localhost:8000)
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

To start the Expo mobile app:
```bash
npm run mobile
```

---

## 🧪 Testing & Verification

MediFlow AI includes an automated test suite across backend and AI services:

```bash
# Run all automated tests (Node.js + Python)
npm test

# Run backend unit & security tests (24 tests)
npm run test:backend

# Run Python AI & Ollama tests (13 tests)
npm run test:ai

# Build web frontend
npm run build:web

# Typecheck mobile TypeScript
cd mobile && npx tsc --noEmit
```

All 37 automated tests verify:
- Dynamic availability slot calculation and doctor working-day validation.
- Concurrency-safe double-booking prevention.
- Role-based authorization (RBAC) and record ownership protection.
- Strict credential validation rejecting invalid passwords with 401.
- Ollama local LLM chat, multilingual prompts, and emergency red-flag override.
- Unhandled request timeouts and graceful clinical fallbacks.

---

## 📄 Documentation

- [Master Development Prompt](docs/MASTER_PROMPT.md)
- [Changelog & Audit History](docs/CHANGELOG.md)
- [Project Architecture & Status](docs/PROJECT_STATUS.md)
- [Ollama Local LLM Integration Guide](docs/OLLAMA_INTEGRATION.md)

---

## ⚖️ Legal & Medical Notice

MediFlow AI is an appointment scheduling and healthcare coordination platform. AI-assisted recommendations and symptom triage are informational aids and do not constitute formal medical diagnoses or clinical treatment plans. In life-threatening emergencies, dial **108 / 112** (India) or **911** (US) immediately.

---

## 👤 Author & Maintainer

**Vinay Kumar**  
GitHub: [@vinaykumar-bille](https://github.com/vinaykumar-bille)  
Repository: [Vinay_Kumar_pdd](https://github.com/vinaykumar-bille/Vinay_Kumar_pdd.git)
