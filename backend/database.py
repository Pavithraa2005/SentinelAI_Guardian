import os
import json
import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./sentinel.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="analyst")  # analyst, admin, manager

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    category = Column(String)  # Phishing, Ransomware, UBA, Network, Dark Web, Deception, Cloud, API
    agent = Column(String)  # Agent name
    risk_score = Column(Float)  # 0 to 100
    severity = Column(String)  # Low, Medium, High, Critical
    status = Column(String, default="active")  # active, investigating, resolved, suppressed
    source = Column(String)  # Affected host, IP, email address, API, etc.
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    details_json = Column(Text)  # Detailed agent metrics (e.g. file path, packet size)
    explanation = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)

class Vulnerability(Base):
    __tablename__ = "vulnerabilities"
    id = Column(Integer, primary_key=True, index=True)
    cve_id = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(Text)
    cvss_score = Column(Float)
    severity = Column(String)  # Low, Medium, High, Critical
    status = Column(String, default="open")  # open, patching, resolved, risk_accepted
    asset = Column(String)  # e.g., web-server-01, internal-db-02
    patch_status = Column(String, default="pending")  # pending, scheduled, applied, verified
    remediation = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ComplianceControl(Base):
    __tablename__ = "compliance_controls"
    id = Column(Integer, primary_key=True, index=True)
    framework = Column(String)  # ISO 27001, SOC 2, GDPR, HIPAA
    control_id = Column(String)  # e.g., CC6.1, A.12.6.1
    title = Column(String)
    description = Column(Text)
    status = Column(String, default="compliant")  # compliant, gap, checking
    evidence = Column(Text)  # Description of gathered evidence
    last_checked = Column(DateTime, default=datetime.datetime.utcnow)

class SystemSetting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if users exist, if not seed DB
        if db.query(User).count() == 0:
            seed_data(db)
    finally:
        db.close()

def seed_data(db):
    import hashlib
    # 1. Create Default Users (password is 'sentinel123' for demo purposes)
    def hash_pwd(pwd):
        return hashlib.sha256(pwd.encode()).hexdigest()

    admin = User(username="admin", password_hash=hash_pwd("sentinel123"), role="admin")
    analyst = User(username="analyst", password_hash=hash_pwd("sentinel123"), role="analyst")
    db.add(admin)
    db.add(analyst)

    # 2. Seed Default Settings
    gemini_key = SystemSetting(key="GEMINI_API_KEY", value=os.getenv("GEMINI_API_KEY", ""))
    slack_webhook = SystemSetting(key="SLACK_WEBHOOK", value="")
    db.add(gemini_key)
    db.add(slack_webhook)

    # 3. Seed Initial Compliance Controls (SOC 2 and ISO 27001)
    controls = [
        # SOC 2
        ComplianceControl(framework="SOC 2", control_id="CC6.1", title="Logical Access Controls", 
                          description="Access to production systems is restricted to authorized personnel.",
                          status="compliant", evidence="JWT session authentication + Active Directory sync logs verified."),
        ComplianceControl(framework="SOC 2", control_id="CC6.3", title="Vulnerability Management", 
                          description="Vulnerability scans are executed regularly and high-risk findings are patched.",
                          status="gap", evidence="Last scan completed 15 days ago. 3 critical CVEs are currently open without a scheduled patch."),
        ComplianceControl(framework="SOC 2", control_id="CC7.1", title="Security Monitoring", 
                          description="The entity detects and logs unauthorized logical access attempts.",
                          status="compliant", evidence="User Behavior Analytics Agent actively monitoring console logins."),
        ComplianceControl(framework="SOC 2", control_id="CC8.1", title="Change Management", 
                          description="Changes to infrastructure are authorized, tested, and approved.",
                          status="compliant", evidence="CI/CD Git commit signatures and PR approval requirements verified."),
        
        # ISO 27001
        ComplianceControl(framework="ISO 27001", control_id="A.12.6.1", title="Management of Technical Vulnerabilities", 
                          description="Information about technical vulnerabilities of information systems is obtained and appropriate measures are taken.",
                          status="gap", evidence="Dependency scans show outdated NPM packages on front-facing apps."),
        ComplianceControl(framework="ISO 27001", control_id="A.9.4.1", title="Information Access Restriction", 
                          description="Access to information and application system functions is restricted in accordance with the access control policy.",
                          status="compliant", evidence="RBAC policy in database applied."),
        ComplianceControl(framework="ISO 27001", control_id="A.12.4.1", title="Event Logging", 
                          description="Event logs recording user activities, exceptions, and security events shall be produced, kept, and regularly reviewed.",
                          status="compliant", evidence="Application logs piped to Redis/SQLite audit trail.")
    ]
    for c in controls:
        db.add(c)

    # 4. Seed Initial Vulnerabilities (CVEs)
    cves = [
        Vulnerability(cve_id="CVE-2024-3094", title="XZ Utils Backdoor",
                      description="Malicious code was discovered in the upstream tarballs of xz, leading to potential SSH daemon compromise.",
                      cvss_score=10.0, severity="Critical", status="open", asset="prod-backend-vm", patch_status="scheduled",
                      remediation="Upgrade xz-utils to version 5.6.1 or downgrade to 5.4.6."),
        Vulnerability(cve_id="CVE-2023-38606", title="Apple iOS Kernel Vulnerability",
                      description="An issue in kernel state handling could allow a local attacker to bypass memory protections and execute arbitrary code.",
                      cvss_score=8.8, severity="High", status="open", asset="mdm-iphone-12", patch_status="pending",
                      remediation="Apply iOS 16.6 update immediately."),
        Vulnerability(cve_id="CVE-2023-4863", title="libwebp Heap Buffer Overflow",
                      description="A heap buffer overflow vulnerability in libwebp allows an attacker to execute arbitrary code via a crafted WebP image.",
                      cvss_score=9.8, severity="Critical", status="resolved", asset="marketing-landing-page", patch_status="verified",
                      remediation="Upgrade libwebp to 1.3.2 or above."),
        Vulnerability(cve_id="CVE-2024-21626", title="runc Container Escape",
                      description="runc allows an attacker to leak file descriptors into a container, allowing container breakout and host filesystem access.",
                      cvss_score=8.6, severity="High", status="open", asset="k8s-worker-node-3", patch_status="pending",
                      remediation="Upgrade runc to version 1.1.12 or newer.")
    ]
    for cv in cves:
        db.add(cv)

    # 5. Seed Initial Alerts
    now = datetime.datetime.utcnow()
    alerts = [
        Alert(title="Suspicious Remote SSH Login Attempt",
              description="Multiple failed login attempts followed by a successful login from a high-risk IP address in Lithuania.",
              category="UBA", agent="User Behavior Analytics Agent", risk_score=85.0, severity="High", status="active",
              source="admin (IP: 185.220.101.5)", timestamp=now - datetime.timedelta(minutes=15),
              details_json=json.dumps({"failed_attempts": 14, "target_user": "admin", "location": "Vilnius, Lithuania", "mfa_bypass": "SMS fallback utilized"}),
              explanation="The user account 'admin' was accessed from an IP address associated with a known Tor exit node. Prior to the successful login, 14 failed attempts were recorded within a 2-minute window, suggesting a credential stuffing or brute force attack.",
              recommendations="1. Terminate the active session for user 'admin' immediately.\n2. Revoke the SMS MFA option and enforce hardware keys/authenticator app.\n3. Add IP 185.220.101.5 to the blocklist."),
        
        Alert(title="Massive Encryption Activity Detected",
              description="High frequency of file modification and renaming detected in directory '/var/www/uploads'. Consistent with Ransomware behavior.",
              category="Ransomware", agent="Ransomware Detection Agent", risk_score=98.0, severity="Critical", status="active",
              source="prod-file-server", timestamp=now - datetime.timedelta(minutes=32),
              details_json=json.dumps({"modified_files_count": 420, "encryption_entropy": 7.95, "affected_directory": "/var/www/uploads", "extension_appended": ".locked"}),
              explanation="An process (PID: 9482) is rapidly renaming files and appending the '.locked' extension. The file contents show high entropy, which is a mathematical indicator of encryption. This strongly resembles a ransomware payload running on the server.",
              recommendations="1. Terminate process PID 9482 immediately.\n2. Isolate 'prod-file-server' from the local network to prevent lateral movement.\n3. Restore the /var/www/uploads folder from the read-only snapshot taken at 04:00 UTC."),
              
        Alert(title="Potential Phishing Link in Incoming Email",
              description="Incoming email containing a link masquerading as 'microsoft-login.com' was flagged by the mail scanner.",
              category="Phishing", agent="Phishing Detection Agent", risk_score=72.0, severity="Medium", status="investigating",
              source="employee-inbox@sentinel.ai", timestamp=now - datetime.timedelta(hours=2),
              details_json=json.dumps({"sender": "billing-support@micros0ft-billing.com", "subject": "URGENT: Verify your Office 365 Account", "destination_url": "http://microsoft-login.com/auth/login"}),
              explanation="The email claims to be from Microsoft Support but was sent from 'micros0ft-billing.com' (note the zero instead of 'o'). It contains a link to 'microsoft-login.com', which is a typosquatted domain hosted on a low-reputation ASN.",
              recommendations="1. Quarantine the email from all user mailboxes.\n2. Add 'micros0ft-billing.com' to the corporate email blackhole list.\n3. Alert the target user regarding the incident."),
              
        Alert(title="Exposed AWS Credentials in Dark Web Forum",
              description="A credential dump on a hacker forum contains valid API keys linked to our staging GCP/AWS organization.",
              category="Dark Web", agent="Dark Web Monitoring Agent", risk_score=90.0, severity="High", status="active",
              source="darkweb-monitor", timestamp=now - datetime.timedelta(hours=5),
              details_json=json.dumps({"forum_name": "BreachForums", "user_alias": "leaklord", "leaked_keys_preview": "AKIAIOSFODNN7XXXXXXX"}),
              explanation="Our automated dark web scraper detected a paste listing active AWS/GCP credential strings. The key suffix matches an IAM user 'staging-deployment-bot' within our environment, creating a risk of complete infrastructure takeover.",
              recommendations="1. Deactivate the leaked IAM user 'staging-deployment-bot' key immediately in the cloud console.\n2. Rotate all credentials associated with the staging environment.\n3. Audit CloudTrail logs for actions executed by this IAM key in the last 48 hours."),
              
        Alert(title="API Token Abuse / Direct Object Reference Spike",
              description="API endpoint '/api/v1/customer/profile' is receiving a high rate of requests iterating over ID parameters.",
              category="API Security", agent="API Security Agent", risk_score=68.0, severity="Medium", status="resolved",
              source="external-api-gateway", timestamp=now - datetime.timedelta(hours=12),
              details_json=json.dumps({"request_count_1m": 1200, "unique_ids_queried": 150, "http_status_returned": 200, "attacker_ip": "45.138.22.90"}),
              explanation="An external IP is performing an BOLA (Broken Object Level Authorization) attack, crawling user records by enumerating ID numbers. Since authentication tokens were missing or misconfigured on this microservice, it returned valid data for other accounts.",
              recommendations="1. Deploy temporary rate-limiting (max 5 req/min per IP) on '/api/v1/customer/profile'.\n2. Enforce strict authorization checks ensuring users can only access their own profile ID.\n3. Require API Bearer token verification.")
    ]
    for al in alerts:
        db.add(al)

    db.commit()
