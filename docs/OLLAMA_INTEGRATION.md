# MediBook AI / HealthNet - Ollama Local LLM Integration Guide

## 1. Overview & Objectives

**MediBook AI (HealthNet)** integrates local large language model (LLM) capabilities powered by **Ollama**. This integration gives patients and healthcare staff access to a private, low-latency, and cost-free conversational healthcare coordinator running entirely on-premises without transmitting sensitive patient health inquiries to third-party proprietary cloud APIs.

### Key Capabilities
- **Local Clinical Conversation**: Answers patient queries regarding clinical departments, platform features, and appointment logistics.
- **Appointment Scheduling Guidance**: Guides patients step-by-step on how to browse doctors, choose consultation modes (in-person vs. HD video teleconsultation), and prepare relevant medical records.
- **Deterministic Red-Flag Safety Pre-Check**: Intercepts potentially life-threatening medical emergencies (e.g. crushing chest pain, slurred speech, sudden paralysis) before the LLM generates a response, prioritizing immediate referral to national emergency services (108 / 112 in India, 911 in the US).
- **Graceful Dual-Tier Fallback**: If the local Ollama daemon or the Python AI microservice is offline or warming up, both the Node.js backend and React frontend seamlessly fall back to MediBook AI's deterministic clinical decision-support rules without crashing.
- **Hardware-Optimized Model Selection**: Defaults to `llama3.2:3b` (~2.0 GB disk space, ~2.5 GB RAM footprint), tailored for standard developer laptops and clinical workstations with 8 GB of RAM.

---

## 2. Architecture & Request Flow

```
                                      +---------------------------------------------+
                                      |                 PATIENT UI                  |
                                      |   (React Web Dashboard / Expo Mobile App)   |
                                      +---------------------------------------------+
                                                             |
                                       POST /api/ai/chat     | (JWT Bearer Auth Token)
                                                             v
                                      +---------------------------------------------+
                                      |            NODE.JS / EXPRESS API            |
                                      |              (Port 5000)                    |
                                      | - Rate Limiter (60 req/min per IP)          |
                                      | - JWT Token Verification & RBAC             |
                                      | - Payload Sanitization & Size Guard (2000c) |
                                      | - Red-Flag Pre-Check (Defense in Depth)     |
                                      +---------------------------------------------+
                                                             |
                                       POST /api/ai/chat     | (10s AbortSignal Timeout)
                                                             v
                                      +---------------------------------------------+
                                      |        PYTHON FASTAPI AI MICROSERVICE       |
                                      |              (Port 8000)                    |
                                      | - Clinical NLP Triage Rule Pre-Check        |
                                      | - Emergency Red-Flag Interceptor            |
                                      | - System Prompt Clinical Guardrails         |
                                      | - Ollama HTTP API Client                    |
                                      +---------------------------------------------+
                                                             |
                                       POST /api/chat        | (HTTP Native Stream: false)
                                                             v
                                      +---------------------------------------------+
                                      |              OLLAMA DAEMON                  |
                                      |             (Port 11434)                    |
                                      | Model: llama3.2:3b (or llama3.2:1b)         |
                                      | Local GGUF Quantized Inference              |
                                      +---------------------------------------------+
```

### Safety and Red-Flag Priority Rule
If emergency symptoms (such as `crushing chest pain`, `severe shortness of breath`, or `unconscious`) are detected at either the Node.js or FastAPI tier, the system **bypasses the LLM entirely** and immediately returns a high-priority emergency alert with direct telephone actions for national ambulance services (108 / 112).

---

## 3. Hardware Requirements & Model Selection

Hardware analysis for the local development workstation indicates:
- **Logical CPU Cores**: 8 cores
- **Total Physical RAM**: ~7.84 GB (~8 GB RAM)
- **Available RAM**: ~0.5 - 2.0 GB dynamic free memory

### Recommended Models for 8 GB RAM Systems

| Model Name | Parameter Size | Download Size | Working RAM Footprint | Performance & Suitability |
| :--- | :--- | :--- | :--- | :--- |
| **`llama3.2:3b`** *(Recommended)* | 3.2 Billion | **~2.0 GB** | **~2.5 GB - 3.2 GB** | **Optimal balance** of clinical reasoning, conversational nuance, and low memory consumption. |
| **`llama3.2:1b`** *(Ultra-Light)* | 1.2 Billion | **~1.3 GB** | **~1.5 GB** | High-speed response, ideal if multiple heavy background development servers run simultaneously. |
| **`mistral:7b`** *(High Resource)* | 7.2 Billion | ~4.1 GB | ~5.5 GB - 6.5 GB | Not recommended for 8 GB systems due to potential memory swapping and thrashing. |

---

## 4. Windows Installation Instructions for Ollama

Ollama is not yet installed on this development machine. Follow these official, safe steps to set it up:

### Step 1: Download the Official Windows Installer
1. Open your browser and navigate to the official download page:
   ```
   https://ollama.com/download/windows
   ```
2. Download `OllamaSetup.exe`.

### Step 2: Run the Installer
1. Execute `OllamaSetup.exe` and follow the standard on-screen wizard.
2. Ollama will install to `%LOCALAPPDATA%\Programs\Ollama` and automatically register `ollama` in your system `PATH`.
3. The background service starts automatically in your Windows system tray.

### Step 3: Verify Installation
Open a PowerShell terminal and run:
```powershell
ollama --version
```
Expected output:
```
ollama version is 0.5.x (or newer)
```

### Step 4: Pull the Recommended Model
Download the recommended `llama3.2:3b` model (requires ~2.0 GB disk space):
```powershell
ollama pull llama3.2:3b
```
*(Alternative for ultra-low memory usage)*:
```powershell
ollama pull llama3.2:1b
```

Verify that the model is downloaded:
```powershell
ollama list
```
Expected output:
```
NAME           ID              SIZE      MODIFIED
llama3.2:3b    a80c4f17acd5    2.0 GB    Just now
```

---

## 5. Environment Variable Configuration

Environment variables configure service URLs and model names across all tiers.

### Root Workspace (`.env` / `.env.example`)
```env
PORT=5000
API_BASE_URL=http://localhost:5000/api
AI_SERVICE_URL=http://127.0.0.1:8000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT_SECONDS=30
```

### Node.js Backend (`backend/.env` / `backend/.env.example`)
```env
PORT=5000
AI_SERVICE_URL=http://localhost:8000
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
```

### Python FastAPI AI Microservice (`ai-service/.env` / `ai-service/.env.example`)
```env
OLLAMA_URL=http://localhost:11434
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT_SECONDS=30.0
MAX_INPUT_LENGTH=2000
```

### React Web (`web/.env` / `web/.env.example`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. How to Start the Integrated Application

You can start the entire stack simultaneously or launch components individually.

### Option A: Complete Development Stack in One Command
From the root workspace directory (`VINAY APP`):
```powershell
npm run dev:all
```
This runs concurrently:
1. Node.js backend on `http://localhost:5000`
2. React Vite web app on `http://localhost:3000`
3. Python FastAPI AI service on `http://localhost:8000`

### Option B: Starting Individual Services in Separate Terminals

#### Terminal 1: Ollama Daemon
```powershell
ollama serve
```
*(Note: If Ollama was installed with the Windows tray application, the daemon is already running automatically in the background on port `11434`)*.

#### Terminal 2: Python FastAPI Microservice
```powershell
cd ai-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Test health endpoint:
```powershell
curl http://localhost:8000/api/ai/health
curl http://localhost:8000/api/ai/ollama/status
```

#### Terminal 3: Node.js Express Backend
```powershell
cd backend
npm start
```
Test backend health:
```powershell
curl http://localhost:5000/api/health
curl http://localhost:5000/api/ai/ollama/status
```

#### Terminal 4: React Web Frontend
```powershell
cd web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Terminal 5: Expo React Native Mobile App (Optional)
```powershell
cd mobile
npx expo start
```

---

## 7. Accessing and Testing the Assistant

### Web Dashboard
1. Open [http://localhost:3000](http://localhost:3000).
2. Log in using Quick Login as **Vinay Kumar** (`vinay@gmail.com`).
3. Click the **AI Assistant** tab in the sidebar navigation.
4. Observe the **Status Pill**:
   - `Ollama (llama3.2:3b)` (green dot) indicates Ollama is running and responding.
   - `Clinical Fallback Engine` (amber dot) indicates Ollama is offline and the deterministic clinical fallback is responding smoothly.
5. Click any suggested prompt chip or type questions:
   - *"How do I book an appointment?"*
   - *"How do video teleconsultations work?"*
   - *"Patient has crushing chest pain and shortness of breath"* (Triggers red-flag emergency alert).

### Mobile Application
1. Open the mobile app in Expo Go or web simulator.
2. Navigate to the **AI Assistant** tab from the bottom navigation.
3. Chat with the coordinator to receive triage advice, department referrals, and booking instructions.

---

## 8. Automated Verification & Regression Testing

The integration includes complete automated test suites with hermetic mocked responses that run reliably offline without requiring an active Ollama process.

### Running Backend Tests (20 Tests)
```powershell
npm run test:backend
# or: node backend/tests/api.test.js
```
Verifies:
- Baseline seed data integrity
- Patient registration and authentication
- Dynamic doctor availability
- Real appointment booking
- Double-booking prevention
- Rescheduling workflows & slot release
- Receptionist check-in queue
- Clinical prescription creation
- Ollama diagnostic status inquiry
- Healthcare assistant conversation workflows
- Emergency red-flag overrides
- Input validation (empty/whitespace/oversized)
- Authenticated JWT token verification
- Unauthorized request rejection (401)
- Fallback resilience when AI microservice is offline

### Running Python AI Microservice Tests (13 Tests)
```powershell
npm run test:ai
# or: python ai-service/test_ai.py
```
Verifies:
- Clinical NLP symptom-to-specialty triage
- Emergency red-flag detection (108/112 referral)
- Multi-attribute doctor recommendation scoring
- 7-day appointment demand forecasting
- Ollama offline connectivity status (`UNAVAILABLE`)
- Ollama online model verification (`/api/tags`)
- Successful Ollama `/api/chat` assistant responses
- Empty, whitespace, and oversized message rejection (>2000 chars)
- Mandatory emergency red-flag override
- Offline fallback to clinical decision rules
- Request timeout handling
- Malformed/empty model response recovery
- System prompt clinical non-diagnostic guardrails

### Running Web Production Build
```powershell
npm run build:web
# or: cd web && npm run build
```

### Running Mobile TypeScript Verification
```powershell
cd mobile
npx tsc --noEmit
```

---

## 9. Medical Safety & Privacy Considerations

1. **Non-Diagnostic Nature**: MediBook AI does not provide automated clinical diagnosis or prescribe medications. Every AI response includes a visible disclaimer advising patients to consult certified practitioners.
2. **Emergency Red-Flag Priority**: Deterministic emergency keyword extraction takes unconditional priority over LLM inference. Life-threatening symptoms immediately trigger ambulance call instructions (108 / 112).
3. **No Direct Database Writes by LLM**: The LLM cannot directly execute database operations or alter appointments. Appointment creation, cancellation, and rescheduling are performed exclusively through authorized backend service workflows.
4. **Data Privacy & PHI Protection**: User queries are processed locally by Ollama. No personal health information (PHI) is stored in raw server logs or transmitted to third-party proprietary AI providers.
5. **Rate Limiting & Abuse Prevention**: Requests are rate-limited to 60 requests per minute per IP, and payloads exceeding 2,000 characters are rejected with HTTP 400.

