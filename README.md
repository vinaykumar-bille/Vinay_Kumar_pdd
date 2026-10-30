# AI-Powered Smart Doctor Appointment & Healthcare Management System (MediBook AI / HealthNet)

HealthNet is a fully responsive, enterprise-grade clinical administration and patient scheduling portal built using **React.js (Vite)**, **Tailwind CSS**, **Node.js (Express.js)**, **Python FastAPI AI Microservice**, **Ollama Local LLM**, **MongoDB**, and **Firebase Authentication**.

It features a dual operation layout:
1. **Production Mode**: Integrates directly with Mongo Atlas clusters, live Firebase SDK projects, Python FastAPI, and local Ollama LLMs.
2. **Zero-Config Demonstration Mode**: Operates completely in-memory on local state fallbacks with pre-seeded data, letting presenters, students, and examiners launch and showcase the entire project **instantly in 1 click** without setting up third-party services first!

---

## 🚀 Presentation Highlight: One-Click Quick Logins
For final year/college mini-project reviews, typing credentials live on stage can be slow. HealthNet includes **One-Click Quick Login Triggers** on the Sign-In portal:
* **Patient Portal**: Log in as `Vinay Kumar` (`vinay@gmail.com`) to schedule slots, run symptom chats, upload records, and check prescriptions.
* **Doctor Portal**: Log in as `Dr. Amit Verma` (`amit.verma@healthnet.com`) to approve/cancel bookings, review folders, and generate interactive digital prescriptions.
* **Admin Portal**: Log in as `admin@gmail.com` to review weekly graphical trends (Recharts), manage doctor registries (CRUD), and review global schedules.

---

## 📦 Features Walkthrough

### 1. Landing Page
* Professional corporate clinical design in curated cobalt blue and clean teal.
* Dynamic hospital metrics grid.
* Specialty explorer detailing Cardiology, Neurology, ENT, Orthopedics, Pediatrics, Dermatology, and General Medicine.
* Support contact inquiry panel.

### 2. Smart Roster Scheduler
* Patients select departments and matching practitioners (20+ preloaded specialists!).
* **Overlap Prevention**: Restricts slot selections if another patient has already secured that doctor on the specified date/time.
* **AI Slot Recommendations**: Highlights availability calendars.

### 3. Ollama Local LLM & AI Triage Assistant
* **Local Conversational Assistant**: Integrated healthcare assistant powered by **Ollama (`llama3.2:3b`)**.
* **Clinical Safety Guardrails**: Emphasizes non-diagnostic healthcare guidance and directs users to licensed physicians.
* **Deterministic Emergency Red-Flag Interceptor**: Critical symptoms (crushing chest pain, slurred speech, sudden paralysis) trigger immediate emergency alert and ambulance dial (108 / 112) without waiting for the LLM.
* **Dual-Tier Fallback Resilience**: Seamless fallback to rule-based clinical engine if Ollama is offline or warming up.
* **Ollama Status Monitoring**: Real-time connection badge (Online / Fallback) on the patient dashboard.
* Comprehensive guide: see [docs/OLLAMA_INTEGRATION.md](docs/OLLAMA_INTEGRATION.md).

### 4. Interactive Prescription Generator
* Doctors select active patients and add diagnosis details.
* **Medicine Itemizer**: Dynamic list adder to compile multiple drugs, posology dosages (`1-0-1`), duration, and advice.
* Employs clean printable receipts layout with browser print templates.

### 5. Analytics Dashboard
* Live system metrics counters.
* **AreaChart**: Dynamic daily appointment booking vs completed consultation charts.
* **BarChart**: Physician distribution count split across clinical departments.

---

## 🛠️ Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) (Version >= 16.0.0)
* [Python 3.10+](https://www.python.org/) for the AI microservice
* [Ollama](https://ollama.com/download/windows) (Optional, for local LLM inference)

### Step 1: Initial Setup
Extract the project, open your terminal at the root workspace directory (`VINAY APP`), and run:
```bash
npm run setup
```
*This command automatically installs package dependencies across the root, backend, web, and mobile folders.*

### Step 2: Running Locally
Launch the application components as needed:
* **Web + Backend (Standard)**:
  ```bash
  npm start
  ```
  - **Web Application**: [http://localhost:3000](http://localhost:3000)
  - **Backend API**: [http://localhost:5000](http://localhost:5000)
* **Full Stack (Web + Backend + AI Microservice)**:
  ```bash
  npm run dev:all
  ```
  - **AI Microservice**: [http://localhost:8000](http://localhost:8000)
* **Mobile App (Expo / React Native)**:
  ```bash
  npm run mobile
  ```
* **Automated Verification Tests**:
  ```bash
  npm run test:backend
  npm run test:ai
  ```

---

## 🦙 Ollama Local LLM Setup

To run the local LLM healthcare assistant:
1. Install Ollama from [https://ollama.com/download/windows](https://ollama.com/download/windows).
2. Pull the recommended lightweight model:
   ```bash
   ollama pull llama3.2:3b
   ```
3. Start the Ollama background service:
   ```bash
   ollama serve
   ```
4. MediBook AI automatically detects the running Ollama instance on `http://localhost:11434` and connects seamlessly!

---

## ⚙️ Environment Configurations (`.env`)

Template variables are provided in `.env.example`. Rename it to `.env` in the backend folder to customize live database endpoints:

```env
# Server Config
PORT=5000
API_BASE_URL=http://localhost:5000/api

# AI Microservice & Ollama Configuration
AI_SERVICE_URL=http://127.0.0.1:8000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Leave blank to run in simulated High-Fidelity Demo Mode
MONGODB_URI=
OPENAI_API_KEY=
```
