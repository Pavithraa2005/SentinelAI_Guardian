import os
import json
import random
import datetime
import google.generativeai as genai

def get_gemini_client(api_key: str = None):
    # Try database setting first, then env
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        return None
    try:
        genai.configure(api_key=key)
        # Using Gemini 1.5 Flash for fast and cost-effective responses
        return genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        print(f"Error configuring Gemini client: {e}")
        return None

def query_gemini(prompt: str, system_instruction: str = None, api_key: str = None) -> str:
    model = get_gemini_client(api_key)
    if not model:
        return ""
    try:
        # If model supports system instruction, we pass it, otherwise prepend to prompt
        full_prompt = prompt
        if system_instruction:
            full_prompt = f"System Instruction: {system_instruction}\n\nUser Request: {prompt}"
        
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API execution error: {e}")
        return ""

def explain_threat_with_ai(category: str, title: str, description: str, details_json: str, api_key: str = None) -> dict:
    system_instruction = (
        "You are an expert Security Operations Center (SOC) AI Analyst. "
        "Analyze the provided security alert, explain it in detail, list the business impact, "
        "and provide actionable step-by-step containment and mitigation strategies. "
        "Format your output in clean Markdown."
    )
    
    prompt = f"""
    Analyze the following alert:
    Category: {category}
    Title: {title}
    Description: {description}
    Technical Details (JSON): {details_json}
    
    Provide:
    1. A detailed explanation of what happened and how the attacker likely gained access.
    2. Potential business impact (data loss, operational downtime, reputation).
    3. Actionable step-by-step mitigation/recovery commands and checklists.
    """
    
    ai_response = query_gemini(prompt, system_instruction, api_key)
    
    if ai_response:
        # Parse or format the AI response. Since Gemini returns Markdown, we can return it as-is.
        return {
            "explanation": ai_response,
            "recommendations": "Follow the detailed steps provided in the explanation above."
        }
        
    # Fallback to high-quality template if Gemini is offline
    return get_fallback_explanation(category, title, description, details_json)

def get_fallback_explanation(category: str, title: str, description: str, details_json: str) -> dict:
    # High-quality offline templates for the core alert categories
    details = {}
    try:
        details = json.loads(details_json) if details_json else {}
    except:
        pass

    if category == "Ransomware":
        exp = f"""### Ransomware Encryption Threat Analysis
The system detected abnormal file encryption behavior in `{details.get('affected_directory', '/var/www')}`. 
A process (entropy: `{details.get('entropy', 7.95)}`) has modified and appended `.locked` or random extensions to `{details.get('modified_files_count', 420)}` files.

#### Attack Path:
1. **Initial Access**: Likely an unpatched vulnerability in the public upload form or compromised administrative credentials.
2. **Execution**: The attacker uploaded and executed a binary payload which initiated high-speed, symmetric key encryption.
3. **Defense Evasion**: The malware attempted to clear local Windows shadow copies or Linux journal logs to impede system restoration.

#### Business Impact:
* **High**: Potential loss of user-uploaded documentation, operational interruption of web services, and threat of data exfiltration and double-extortion.
"""
        rec = """1. **Host Isolation**: Disconnect the host `prod-file-server` from the network via firewall rule or VPC detachment.
2. **Kill Process**: Terminate the ransomware controller process.
3. **Backup Restoration**: Revert `/var/www/uploads` to the last cold snapshot (taken 04:00 UTC).
4. **Credential Rotation**: Invalidate all SSH keys and API tokens stored on the compromised host."""
        
    elif category == "UBA":
        exp = f"""### User Behavior Anomaly Detected
The account `{details.get('target_user', 'admin')}` logged in successfully from `{details.get('location', 'Vilnius, Lithuania')}` (`{details.get('attacker_ip', '185.220.101.5')}`) which matches a known Tor exit node or VPN service. 
This followed `{details.get('failed_attempts', 14)}` failed login attempts within a 2-minute interval.

#### Attack Path:
1. **Credential Stuffing**: The threat actor utilized leaked password dumps to systematically attempt login.
2. **MFA Abuse**: The attacker prompted SMS/Push MFA repeatedly until the employee accepted it or bypassed it using an automated fallback channel.

#### Business Impact:
* **Critical**: Unauthorized administrative access grants control over database servers, configurations, and identity directories, risking entire domain compromise.
"""
        rec = """1. **Session Termination**: Invalidate all active sessions for user `admin`.
2. **Force Password Reset**: Enforce a mandatory complex password change for the affected user.
3. **Upgrade MFA**: Disable SMS MFA. Mandate FIDO2 Hardware security keys or standard TOTP authenticator apps.
4. **Log Review**: Audit audit logs for actions performed by this user in the past 24 hours."""

    elif category == "Phishing":
        exp = f"""### Typosquatted Phishing Email Detected
An incoming email to `{details.get('sender', 'employee-inbox@sentinel.ai')}` was quarantined. It originated from a suspicious domain simulating a trusted service (`{details.get('sender', 'micros0ft-billing.com')}`) and contained a high-risk URL: `{details.get('destination_url', 'http://microsoft-login.com')}`.

#### Attack Path:
1. **Social Engineering**: Attacker crafted a fake billing/renewal alert to create urgency.
2. **Delivery**: The email bypassed basic spam filters by utilizing a newly registered domain with clean domain reputation.
3. **Harvesting**: The link leads to a cloned portal intended to harvest OAuth authorization tokens or corporate credentials.

#### Business Impact:
* **Medium**: Potential credential harvest of a corporate user, leading to email compromise, internal spear-phishing, or financial fraud.
"""
        rec = """1. **Purge Email**: Remove the email from all other corporate inboxes.
2. **Domain Blocklist**: Add `micros0ft-billing.com` and `microsoft-login.com` to the organization DNS blocklist.
3. **User Alert**: Inform the user about the campaign and enroll them in targeted phishing training."""
        
    else:
        exp = f"""### General Security Anomaly Detected ({category})
The agent flagged a critical event: **{title}**.
* **Source**: `{details.get('attacker_ip', 'Internal subnet')}` or `{details.get('source', 'System')}`.
* **Details**: {description}

#### Threat Assessment:
- **Tactic**: Unauthorized activity or configuration drift.
- **Vulnerability**: Potential missing patch or exposed API/credentials.
"""
        rec = """1. **Investigate Logs**: Examine syslog and VPC flow logs for related traffic.
2. **Apply Mitigation**: Block the source IP or revoke the associated API keys.
3. **Verify Integrity**: Verify system binaries and configurations against baseline."
"""

    return {"explanation": exp, "recommendations": rec}

def run_ai_chat_assistant(message: str, history: list, api_key: str = None) -> str:
    system_instruction = (
        "You are 'SentinelAI Assistant', an advanced agentic cybersecurity virtual assistant. "
        "You help security analysts, IT administrators, and managers understand cyber threats, "
        "formulate incident response steps, review security policies, and scan compliance controls. "
        "Provide professional, highly detailed, and technical responses. Use Markdown formatting."
    )
    
    # Format chat history for Gemini
    formatted_prompt = "Conversation History:\n"
    for turn in history[-6:]:  # Keep last 6 messages to stay within prompt limits
        role = "User" if turn["role"] == "user" else "Assistant"
        formatted_prompt += f"{role}: {turn['content']}\n"
    
    formatted_prompt += f"\nUser Message: {message}\nAssistant:"
    
    ai_response = query_gemini(formatted_prompt, system_instruction, api_key)
    if ai_response:
        return ai_response
        
    # Fallback chat assistant logic
    message_lower = message.lower()
    if "phishing" in message_lower:
        return """### SentinelAI Assistant: Phishing Mitigation Guide
Phishing remains the #1 initial access vector. To protect the organization, I recommend:
1. **Email Authentication**: Enforce strict **SPF**, **DKIM**, and **DMARC** policies (reject mode).
2. **Zero-Trust Access**: Enforce MFA with FIDO2 tokens to prevent credential harvesting.
3. **API Inspection**: Scan emails dynamically with the **Phishing Detection Agent** to search for brand impersonation and dynamic redirect URLs.
4. **User Awareness**: Run automated simulations and flag external emails with safety banners.

Is there a specific phishing alert in your dashboard you want me to analyze?"""
    elif "ransomware" in message_lower:
        return """### SentinelAI Assistant: Ransomware Incident Response
If you suspect ransomware is currently executing in your network, execute this playbook:
1. **Isolate Immediately**: Disable network access on the infected machine. Do NOT shut it down immediately if memory analysis is required, but sever all network adapters (VPC, Wi-Fi, Ethernet).
2. **Identify the Process**: Run process listing commands to identify processes with high CPU/IO activity writing to critical directories.
3. **Assess Scopes**: Check if shared network drives or backups were exposed.
4. **Recover**: Retrieve read-only, immutable backups to restore files once the binary has been removed and systems have been patched.

I can walk you through isolating a specific server if you select the alert from the **Dashboard**."""
    elif "compliance" in message_lower:
        return """### SentinelAI Assistant: Compliance Posture
I can assist in audit preparation for **SOC 2, ISO 27001, GDPR, and HIPAA**. 
Our **Compliance Automation Agent** has identified **2 control gaps**:
1. **SOC 2 CC6.3 (Vulnerability Management)**: Outstanding high-severity CVEs on production assets.
2. **ISO A.12.6.1 (Technical Vulnerabilities)**: Outdated dependencies in frontend apps.

Would you like me to generate a draft remediation plan for these gaps?"""
    elif "cve" in message_lower or "vulnerabilit" in message_lower:
        return """### SentinelAI Assistant: Vulnerability Patching Priorities
We are currently tracking **3 open vulnerabilities**:
* **CVE-2024-3094** (XZ Utils Backdoor) - Critical (CVSS 10.0) -> *Status: Patch Scheduled*
* **CVE-2023-38606** (iOS Kernel) - High (CVSS 8.8) -> *Status: Pending Action*
* **CVE-2024-21626** (runc Escape) - High (CVSS 8.6) -> *Status: Pending Action*

I recommend prioritizing **CVE-2024-3094** first due to its CVSS 10.0 score and presence in the production backend server."""
    else:
        return f"""### SentinelAI Assistant
I am online and ready to assist you. As a virtual SOC analyst, I can:
* Explain active alerts and build containment playbooks.
* Review cloud configurations for misconfigurations.
* List shadow APIs discovered by the API Security Agent.
* Walk you through incident timelines.

What security topic or incident would you like to investigate?"""

# -----------------
# 2.0 Agent Modules
# -----------------

def run_threat_hunt(hypothesis: str, api_key: str = None) -> dict:
    """
    Threat Hunting Agent: Run hypothesis-driven hunts using MITRE ATT&CK mappings.
    """
    system_instruction = (
        "You are the Threat Hunting Agent for SentinelAI Guardian. "
        "A user will provide a threat hypothesis. Process it, map it to MITRE ATT&CK tactics/techniques, "
        "provide mock hunt results showing indicators of compromise (IOCs) discovered in logs, "
        "and suggest new SIEM/detection rules to prevent future occurrences. "
        "Format your response in clean Markdown."
    )
    
    prompt = f"Run a security hunt based on this hypothesis: '{hypothesis}'"
    ai_response = query_gemini(prompt, system_instruction, api_key)
    
    if ai_response:
        return {"results": ai_response}
        
    # High-quality offline fallback
    mitre_maps = {
        "persistence": ("T1078 (Valid Accounts)", "T1547 (Boot or Logon Autostart Execution)"),
        "credential": ("T1003 (Credential Dumping)", "T1539 (Steal Web Session Cookie)"),
        "exfiltration": ("T1048 (Exfiltration Over Alternative Protocol)", "T1567 (Exfiltration Over Web Service)")
    }
    
    # Deduce tactic
    tactic = "Defense Evasion"
    techniques = ("T1036 (Masquerading)", "T1070 (Indicator Removal)")
    for key, val in mitre_maps.items():
        if key in hypothesis.lower():
            tactic = key.capitalize()
            techniques = val
            break

    mock_iocs = [
        {"timestamp": (datetime.datetime.utcnow() - datetime.timedelta(hours=random.randint(1, 10))).isoformat(),
         "event_id": f"EVT-{random.randint(1000, 9999)}",
         "description": "Unusual Registry run-key modification by unsigned binary",
         "source_host": "ws-engineering-04",
         "severity": "Medium"},
        {"timestamp": (datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 2))).isoformat(),
         "event_id": f"EVT-{random.randint(1000, 9999)}",
         "description": "LSASS process memory read by unauthorized tool (mini-dump style)",
         "source_host": "prod-sql-01",
         "severity": "High"}
    ]
    
    results = f"""### Threat Hunt Results: {hypothesis}
* **Status**: Completed Hunt
* **MITRE ATT&CK Tactic**: {tactic}
* **MITRE ATT&CK Techniques**: {", ".join(techniques)}

#### Hunt Findings (Suspicious Indicators discovered):
1. **Host `prod-sql-01`**: Detected an unauthorized handle to `LSASS.exe` from a non-standard service. This is indicative of **Credential Dumping (T1003)**.
2. **Host `ws-engineering-04`**: Detected auto-start registry creation pointing to temp directory execution.

#### Recommended SIEM / Detection Rules:
```yaml
rule: Detect_LSASS_Access
tactic: Credential Access
trigger:
  process.target: lsass.exe
  process.access_mask: 0x1F1801  # Read/write dump permissions
  process.source.is_signed: false
action: Alert + Auto-Isolate
```
"""
    return {"results": results, "iocs": mock_iocs}

def run_cloud_posture_audit(api_key: str = None) -> list:
    """
    Cloud Security Posture Agent: Continuously audit cloud configurations.
    """
    return [
        {
            "id": 1,
            "provider": "GCP",
            "rule": "Ensure Storage Buckets are not Publicly Accessible",
            "severity": "Critical",
            "status": "fail",
            "asset": "sentinel-public-assets-bucket",
            "details": "Bucket has 'allUsers' set to role 'roles/storage.objectViewer'. Exposed 1,240 items.",
            "recommendation": "Remove 'allUsers' and 'allAuthenticatedUsers' IAM roles. Restrict access using signed URLs or private access policies."
        },
        {
            "id": 2,
            "provider": "AWS",
            "rule": "Ensure MFA is Enforced for IAM Users with Administrative Privileges",
            "severity": "High",
            "status": "fail",
            "asset": "iam-user-deployer-bot",
            "details": "IAM User has AdministratorAccess policy attached, but Multi-Factor Authentication is disabled.",
            "recommendation": "Enforce MFA on AWS IAM Console or rotate access keys to limit administrative power."
        },
        {
            "id": 3,
            "provider": "GCP",
            "rule": "Enable VPC Flow Logging for Production Subnets",
            "severity": "Medium",
            "status": "pass",
            "asset": "vpc-prod-subnet-central1",
            "details": "VPC Flow logs enabled and shipping to Cloud Logging bucket.",
            "recommendation": "None. Audited and compliant."
        },
        {
            "id": 4,
            "provider": "AWS",
            "rule": "Ensure Security Group Port 22 (SSH) is Restricted",
            "severity": "High",
            "status": "fail",
            "asset": "sg-production-web-dmz",
            "details": "Security Group allows inbound SSH traffic from '0.0.0.0/0' (any source).",
            "recommendation": "Modify security group rules to restrict port 22 access to the corporate bastion subnet or trusted VPN gateway."
        }
    ]

def run_api_security_discovery(api_key: str = None) -> list:
    """
    API Security Agent: Discover exposed and shadow APIs.
    """
    return [
        {
            "id": 1,
            "endpoint": "/api/v2/debug/system-metrics",
            "status": "shadow",
            "severity": "High",
            "traffic_rate_1h": 240,
            "auth_method": "None",
            "data_exposed": "Server internal file paths, CPU registry structures, environment variables.",
            "remediation": "Decommission endpoint immediately or restrict network binding to localhost."
        },
        {
            "id": 2,
            "endpoint": "/api/v1/customer/profile",
            "status": "managed",
            "severity": "Medium",
            "traffic_rate_1h": 14200,
            "auth_method": "Bearer JWT Token",
            "data_exposed": "PII (names, emails, partial credit card tokens) - flagged BOLA enumeration vulnerability.",
            "remediation": "Validate path variable matches JWT claims (e.g. customer_id inside token must match requested profile ID)."
        },
        {
            "id": 3,
            "endpoint": "/api/v1/payment/checkout",
            "status": "managed",
            "severity": "Low",
            "traffic_rate_1h": 412,
            "auth_method": "API Key + Encryption",
            "data_exposed": "Standard secure transactional outputs.",
            "remediation": "Ensure annual rotation of merchant gateway keys."
        }
    ]

def run_dark_web_monitoring(api_key: str = None) -> list:
    """
    Dark Web Monitoring Agent: Scrapes for leaked credentials and brand mentions.
    """
    return [
        {
            "id": 1,
            "source": "BreachForums",
            "type": "Credential Leak",
            "leaked_item": "admin@sentinel.ai",
            "details": "Plaintext password 'sentinelPass99' leaked alongside hashed username database.",
            "date": "2026-06-28",
            "severity": "Critical",
            "status": "active"
        },
        {
            "id": 2,
            "source": "Pastebin Dump",
            "type": "Brand Mention",
            "leaked_item": "sentinel.ai domain credentials",
            "details": "Discussion on hacker paste linking internal dev server hostname 'dev-testing.sentinel.ai' with an older port vulnerability.",
            "date": "2026-06-30",
            "severity": "High",
            "status": "investigating"
        },
        {
            "id": 3,
            "source": "Ransomware Portal (LockBit)",
            "type": "Partner Leak",
            "leaked_item": "Vendor invoicing contract files",
            "details": "Documents relating to sentinel.ai billing structure leaked via a vendor breach.",
            "date": "2026-06-25",
            "severity": "Medium",
            "status": "resolved"
        }
    ]

def run_deception_honeypots(api_key: str = None) -> list:
    """
    Deception & Honeypot Agent: Deploy decoy credentials and assets.
    """
    return [
        {
            "id": 1,
            "name": "Honey-DB-Decoy",
            "type": "Decoy Database",
            "location": "subnet-10.0.4.15 (Port 5432)",
            "triggers_count": 0,
            "status": "active",
            "last_trigger": "Never"
        },
        {
            "id": 2,
            "name": "honeytoken-aws-deployer",
            "type": "Decoy API Credential",
            "location": "Embedded in Github Staging Repository config",
            "triggers_count": 4,
            "status": "triggered",
            "last_trigger": "2026-07-01 19:42:01"
        },
        {
            "id": 3,
            "name": "Honey-Share-Finance",
            "type": "Decoy Network Share",
            "location": "\\\\corp-nas-02\\finance-forecast-2027$",
            "triggers_count": 1,
            "status": "triggered",
            "last_trigger": "2026-07-01 10:20:15"
        }
    ]
