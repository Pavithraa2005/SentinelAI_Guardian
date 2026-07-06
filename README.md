# SentinelAI Guardian - Enterprise Multi-Agent AI SOC

![SentinelAI Guardian Banner](./banner.png)

SentinelAI Guardian is an enterprise-grade **multi-agent AI Security Operations Center (SOC)** designed to predict, protect, and respond to cyber threats in real-time. Powered by a collaborative swarm of autonomous AI agents (leveraging **Google Gemini 1.5 Flash**), the platform automates real-time incident analysis, containment scripting, vulnerability management, and regulatory compliance mapping.

---

## ✨ Features

- **🤖 Multi-Agent AI Orchestration:** Multiple specialized agents monitor different aspects of security:
  - **Threat Hunt Agent:** Formulates and runs query hypotheses against internal databases and logs.
  - **Deception & Honeypot Agent:** Traps threats using Canary tokens, decoy credentials, and honeypot alerts.
  - **API Security Agent:** Discovers shadow APIs and monitors for malicious request payloads (e.g., SQL Injection, XSS).
  - **Cloud Posture Agent:** Evaluates GCP/AWS configurations for misconfigured IAM rules or exposed resources.
  - **Dark Web Monitor Agent:** Monitors repositories and pasteboards for typosquatted domains or configuration leaks.
- **⚡ AI Incident Explanation & Playbooks:** Raw alert data is analyzed by Gemini to generate detailed threat narratives, potential business impact, and step-by-step mitigation playbooks.
- **🛡️ Vulnerability Lifecycle Management:** Automatically ranks discovered CVEs by CVSS scores, tracks patch application status, and implements one-click resolutions.
- **📊 Dynamic Compliance Auditor:** Monitors system checks against **ISO 27001**, **SOC 2**, **NIST**, and **HIPAA** compliance guidelines. Dynamically generates reports and lists actionable compliance gaps.
- **💬 Conversational SOC Copilot:** Interactive security assistant chat interface capable of scanning the active threat environment and providing system diagnostics.

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Backend:** FastAPI (Python), SQLAlchemy ORM, SQLite database.
- **AI Core:** Google Gemini 1.5 Flash API (via `google-generativeai`).

---

## 📁 Repository Structure

```text
├── backend/               # FastAPI Server, SQLAlchemy Database, Agent Engine
│   ├── main.py            # API Routes and Core Logic
│   ├── database.py        # Database models (Alerts, Vulns, Compliance)
│   ├── auth.py            # JWT Authentication & Password hashing
│   └── agents_engine.py   # Gemini AI Agent logic & simulation functions
│
├── frontend/              # Next.js Web Portal
│   ├── src/app/           # Next.js pages (dashboard, threats, assistant, etc.)
│   └── public/            # Static assets and icons
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### 1. Set Up the Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   python main.py
   ```
   The backend will run at `http://127.0.0.1:8000`.

### 2. Set Up the Frontend

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser to view the application.

---

## ⚙️ Configuration & API Integration

Once running:
1. Log in or Register a new analyst account in the SentinelAI Guardian portal.
2. Go to the **Settings** tab.
3. Paste your **Gemini API Key** in the API Key input and click save.
   *Note: If no API key is specified, the application automatically falls back to static high-fidelity response mockups so the system remains fully interactive.*

---

## 🔒 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
