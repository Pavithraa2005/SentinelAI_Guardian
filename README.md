# SentinelAI Guardian - Enterprise Multi-Agent AI SOC

![SentinelAI Guardian Banner](C:\Users\ADMIN\.gemini\antigravity\brain\b5a0beff-11fa-46aa-9d24-e93786af64c2\hackathon_banner_1783346760283.png)

SentinelAI Guardian is an enterprise-grade Autonomous Multi-Agent Security Operations Center (SOC) orchestrator designed to predict, detect, and remediate cyber threats in real-time. By utilizing a collaborative swarm of specialized AI agents powered by the Google Gemini 1.5 Flash model, the platform automates complex alert synthesis, incident containment, vulnerability patching, and continuous regulatory compliance mapping.

---

## Core Capabilities

### 1. Collaborative Multi-Agent Orchestration
SentinelAI Guardian deploys decentralized, specialized AI agents monitoring distinct attack surfaces:
*   **Threat Hunt Agent:** Executes proactive, hypothesis-driven database and system log audits to detect lateral movement.
*   **Deception and Honeypot Agent:** Controls Canary tokens and decoy assets, trapping and alerting on early-stage intrusion indicators.
*   **API Security Agent:** Discovers shadow API endpoints and inspects incoming payloads for injection vulnerabilities (SQLi, XSS).
*   **Cloud Posture Agent (CSPM):** Audits cloud configurations (GCP/AWS/Azure) against identity policies and public resource exposures.
*   **Dark Web Monitor Agent:** Continuously scans repositories and pasteboards for leaked keys or configuration files.

### 2. Intelligent Threat Synthesis and Playbooks
Translates raw, high-volume telemetry and system logs into structured incident files. Utilizing Gemini, the platform dynamically generates:
*   **Attack Vector Analysis:** Human-readable explanations of execution paths.
*   **Business Impact Assessment:** Financial, operational, and reputational risk analysis.
*   **Actionable Mitigation Checklists:** Step-by-step containment playbooks and command-line scripts.

### 3. Vulnerability Lifecycle Management
Integrates a continuous scanner that detects, analyzes, and lists CVEs. Vulnerabilities are automatically indexed by CVSS severity and can be resolved immediately via virtual, one-click patch deployments.

### 4. Continuous Compliance Auditing
Performs automated configuration mapping against major regulatory frameworks including ISO 27001, SOC 2, NIST, and HIPAA. Dynamically flags gaps and provides evidence reports for external audits.

---

## System Architecture and Tech Stack

```text
               ┌──────────────────────────────┐
               │    Next.js 15 React Portal   │
               └──────────────┬───────────────┘
                              │ HTTPS / JSON
                              ▼
               ┌──────────────────────────────┐
               │     FastAPI Backend API      │
               └──────┬────────────────┬──────┘
                      │                │
                      ▼                ▼
        ┌─────────────┴──────┐  ┌──────┴─────────────┐
        │  SQLite Database   │  │   Gemini 1.5 API   │
        │ (SQLAlchemy ORM)   │  │ (Agent Reasoning)  │
        └────────────────────┘  └────────────────────┘
```

*   **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Recharts.
*   **Backend:** FastAPI (Python), SQLAlchemy ORM, SQLite.
*   **AI Integration:** Google Gemini 1.5 Flash SDK (google-generativeai) for high-throughput reasoning.

---

## Repository Structure

```text
├── backend/               # FastAPI Server & Database Engine
│   ├── main.py            # API controller and endpoint routes
│   ├── database.py        # Schema definitions and database initialization
│   ├── auth.py            # Cryptographic utilities and JWT authentication
│   └── agents_engine.py   # AI agent orchestration and LLM integrations
│
├── frontend/              # Next.js Application
│   ├── src/app/           # Component layouts and page views
│   └── public/            # Core visual assets and styling definitions
```

---

## Setup and Installation

### Prerequisites
*   Python 3.10 or higher
*   Node.js 18 or higher
*   Google Gemini API Key (Get an API Key at Google AI Studio)

### 1. Backend Service Configuration
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Initialize and activate the Python virtual environment:
    ```bash
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # Linux / macOS:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the API server:
    ```bash
    python main.py
    ```
    *The API gateway will start locally at http://127.0.0.1:8000.*

### 2. Frontend Portal Configuration
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *The web portal will be accessible at http://localhost:3000.*

---

## Configuration and Key Management

To enable full AI analytics and agent decision-making:
1.  Log in to the SentinelAI Guardian portal.
2.  Navigate to Settings in the dashboard.
3.  Enter your Gemini API Key and click Save. 

*Note: The platform features high-fidelity offline fallback scripts. If no API key is active, agent responses and alert containment playbooks will remain fully functional via pre-defined template configurations.*

---

## License
This project is released under the MIT License. For details, please consult LICENSE.
