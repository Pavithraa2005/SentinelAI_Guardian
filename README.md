# SentinelAI Guardian - Enterprise Multi-Agent AI SOC

<p align="center">
  < alt="SentinelAI Guardian Banner" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-SentinelAI%20Guardian-00f0ff?style=for-the-badge&labelColor=0a0f1d" alt="Platform">
  <img src="https://img.shields.io/badge/Security-Multi--Agent%20Orchestrator-0052ff?style=for-the-badge&labelColor=0a0f1d" alt="Security">
  <img src="https://img.shields.io/badge/AI-Gemini%201.5%20Flash-00a2ff?style=for-the-badge&labelColor=0a0f1d" alt="AI">
</p>

---

SentinelAI Guardian is an enterprise-grade Autonomous Multi-Agent Security Operations Center (SOC) orchestrator designed to predict, detect, and remediate cyber threats in real-time. By utilizing a collaborative swarm of specialized AI agents powered by the Google Gemini 1.5 Flash model, the platform automates complex alert synthesis, incident containment, vulnerability patching, and continuous regulatory compliance mapping.

---

## 1. Executive Summary and Architecture

Modern security operations centers struggle with alert fatigue, complex cloud infrastructures, and shadow API exposures. SentinelAI Guardian addresses these challenges by replacing static rule-based alert systems with a dynamic swarm of specialized AI security agents. These agents analyze real-time system logs, perform targeted queries, and produce rich, context-aware threat summaries.

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

The system separates concerns across three primary tiers:
*   **Intelligence Tier:** Powered by Google Gemini 1.5 Flash, providing deep contextual logic to analyze anomalies, map compliance regulations, and answer analyst queries.
*   **Orchestration Tier:** A FastAPI-based backend exposing RESTful APIs, managing task workers, simulating threat behaviors, and tracking database records via SQLAlchemy.
*   **Presentation Tier:** An interactive Next.js dashboard that visualizes network metrics, active alerts, compliance gap analyses, and live chat assistance.

---

## 2. Multi-Agent Swarm Deep Dive

Rather than relying on a single monolith, the platform leverages five independent, specialized security agents. Each agent acts on distinct logs and telemetry:

### Threat Hunt Agent
*   **Objective:** Identify unauthorized access patterns and lateral movements inside database and application layers.
*   **Telemetry Input:** Query history, database transactions, database access counts, and time-series query volumes.
*   **Actionable Output:** Highlights anomalies in query frequency or execution times, exposing potential data extraction attempts.

### Deception and Honeypot Agent
*   **Objective:** Catch and analyze early-stage external threats via decoy assets.
*   **Telemetry Input:** Canary token logs, fake credential access logs, and connections to restricted sandbox subnets.
*   **Actionable Output:** Traces the attacker's source IP, geo-location, and attempted system queries.

### API Security Agent
*   **Objective:** Discover unregistered (shadow) APIs and intercept web attacks.
*   **Telemetry Input:** HTTP request paths, query parameters, authorization headers, and input payloads.
*   **Actionable Output:** Identifies patterns indicating SQL injection, Cross-Site Scripting (XSS), or credential stuffing.

### Cloud Posture Agent
*   **Objective:** Enforce Cloud Security Posture Management (CSPM) guidelines.
*   **Telemetry Input:** IAM policies, public storage bucket configurations, and cloud network security groups (AWS, GCP, Azure).
*   **Actionable Output:** Flags misconfigured policies, insecure default settings, or overly permissive developer configurations.

### Dark Web Monitor Agent
*   **Objective:** Discover external brand exposure and data leaks.
*   **Telemetry Input:** Code sharing platforms, public pasteboards, and dark web indexes.
*   **Actionable Output:** Flags leaked credentials, configuration keys, or exposed code directories mentioning internal domains.

---

## 3. Core System Modules

### AI Threat Analysis and Explanation
When telemetry triggers an alert, the raw log is formatted and passed to the Gemini engine with precise system instructions. The LLM processes the input and returns a structured markdown analysis details:
1.  **Attack Narrative:** A human-readable walkthrough of the compromised system, the execution vectors, and how the attacker bypassed initial defenses.
2.  **Business Risk Assessment:** Classification of risks based on potential financial loss, service downtime, or regulatory violations.
3.  **Remediation Steps:** Containment scripts (Bash and PowerShell) to quickly terminate malicious processes or adjust firewall rules.

### Vulnerability Management Lifecycle
The portal lists active system vulnerabilities extracted from continuous infrastructure scans:
*   **Severity Mapping:** Tracks CVE designations and CVSS scores to prioritize patching workflows.
*   **Status Tracking:** Classifies items as active, in-progress, or patched.
*   **One-Click Patching:** Simulates virtual patching to remediate vulnerable configurations or packages, updating the system state in the central database.

### Continuous Compliance Auditor
The compliance module conducts regular audits against industry regulations (ISO 27001, SOC 2, NIST, HIPAA):
*   **Postures and Controls:** Verifies configurations against defined compliance checklists.
*   **Remediation Mapping:** Details gaps, evidence required, and corresponding steps to resolve compliance gaps.
*   **Report Generation:** Generates instant audit readiness scores and exports structured compliance status reports.

---

## 4. API Reference Guide

### Authentication
*   `POST /api/auth/register` - Registers a new analyst with credentials.
*   `POST /api/auth/login` - Validates credentials and returns a JWT access token.
*   `GET /api/auth/me` - Validates token integrity and returns the active user session.

### Security Alerts and Simulations
*   `GET /api/alerts` - Returns list of active threat incidents, filterable by status and category.
*   `GET /api/alerts/{id}` - Fetches detail for a specific alert, triggering Gemini to explain the threat if not already parsed.
*   `POST /api/alerts/{id}/action` - Executes mitigation playbooks (actions include isolate, quarantine, patch, ignore, resolve).
*   `POST /api/alerts/simulate` - Simulates a randomized threat (network data exfiltration, honeypot access, API SQL injection, public pasteboard credential leak).

### Vulnerabilities
*   `GET /api/vulnerabilities` - Lists system vulnerabilities ordered by CVSS severity.
*   `POST /api/vulnerabilities/{id}/patch` - Applies a virtual patch, updating vulnerability status to resolved.

### Compliance
*   `GET /api/compliance` - Lists all compliance controls and audit checklist items.
*   `POST /api/compliance/report` - Calculates compliance statistics, highlighting specific gaps and remediation details.

### AI Assistant & Custom Agent Modules
*   `POST /api/assistant/chat` - Submits a prompt to the conversational assistant along with historical messages.
*   `POST /api/agents/threat-hunt` - Triggers a custom AI agent execution analyzing a specific threat hypothesis.
*   `GET /api/agents/cloud-posture` - Pulls real-time cloud environment posture audit reports.
*   `GET /api/agents/api-security` - Returns shadow API exposures and payload analysis logs.
*   `GET /api/agents/dark-web` - Searches pasteboards and returns recent corporate brand mentions.
*   `GET /api/agents/deception` - Details honeytoken interactions and decoys currently under attack.

---

## 5. Repository Structure

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

## 6. Setup and Installation

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

## 7. Configuration and Key Management

To enable full AI analytics and agent decision-making:
1.  Log in to the SentinelAI Guardian portal.
2.  Navigate to Settings in the dashboard.
3.  Enter your Gemini API Key and click Save. 

*Note: The platform features high-fidelity offline fallback scripts. If no API key is active, agent responses and alert containment playbooks will remain fully functional via pre-defined template configurations.*

---

## 8. License
This project is released under the MIT License. For details, please consult LICENSE.
