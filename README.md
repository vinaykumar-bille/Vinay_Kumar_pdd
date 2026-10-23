# AI-Powered Smart Doctor Appointment & Healthcare Management System

HealthNet is a fully responsive, enterprise-grade clinical administration and patient scheduling portal built using **React.js (Vite)**, **Tailwind CSS**, **Node.js (Express.js)**, **MongoDB**, and **Firebase Authentication**.

It features a dual operation layout:
1. **Production Mode**: Integrates directly with Mongo Atlas clusters, live Firebase SDK projects, and OpenAI models.
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

### 3. AI Triage Assistant
* Integrated chatbot analyzing described symptoms.
* Automatic keyword mapping to department (e.g. Chest tightness -> Cardiology referral).
* Visual "Book in Department" routing shortcuts inside bubbles.
* Bold emergency medical disclaimers.

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
* Ensure [Node.js](https://nodejs.org/) (Version >= 16.0.0) is installed.

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

## ⚙️ Environment Configurations (`.env`)

Template variables are provided in `.env.example`. Rename it to `.env` in the backend folder to customize live database endpoints:

```env
# Server Config
# The system runs immediately in Demo Mode if these are left blank.
PORT=5000

# Leave blank to run in simulated High-Fidelity Demo Mode
MONGODB_URI=
OPENAI_API_KEY=
```
