import datetime
import json
import random
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

import database
import auth
import agents_engine

# Initialize Database
database.init_db()

app = FastAPI(title="SentinelAI Guardian API", version="2.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Schemas
class UserLogin(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str
    role: Optional[str] = "analyst"

class ActionRequest(BaseModel):
    action: str  # isolate, quarantine, patch, ignore, resolve

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []

class SettingUpdate(BaseModel):
    key: str
    value: str

class ThreatHuntRequest(BaseModel):
    hypothesis: str

# -----------------
# Auth Routes
# -----------------

@app.post("/api/auth/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(database.User).filter(database.User.username == user_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_pwd = auth.hash_password(user_data.password)
    new_user = database.User(username=user_data.username, password_hash=hashed_pwd, role=user_data.role)
    db.add(new_user)
    db.commit()
    return {"message": "Registration successful"}

@app.post("/api/auth/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(database.User).filter(database.User.username == login_data.username).first()
    if not user or not auth.verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "username": user.username}

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(auth.get_current_user)):
    return current_user

# -----------------
# Settings Routes
# -----------------

@app.get("/api/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(database.SystemSetting).all()
    # Mask API key for security if returned
    output = {}
    for s in settings:
        if s.key == "GEMINI_API_KEY" and s.value:
            output[s.key] = s.value[:6] + "..." + s.value[-4:] if len(s.value) > 10 else "********"
        else:
            output[s.key] = s.value
    return output

@app.post("/api/settings")
def update_setting(update: SettingUpdate, db: Session = Depends(get_db)):
    db_setting = db.query(database.SystemSetting).filter(database.SystemSetting.key == update.key).first()
    if not db_setting:
        db_setting = database.SystemSetting(key=update.key, value=update.value)
        db.add(db_setting)
    else:
        db_setting.value = update.value
    db.commit()
    return {"message": f"Setting '{update.key}' updated successfully"}

# -----------------
# Alert / Threat Routes
# -----------------

@app.get("/api/alerts")
def get_alerts(category: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(database.Alert)
    if category:
        query = query.filter(database.Alert.category == category)
    if status:
        query = query.filter(database.Alert.status == status)
    
    # Return sorted by timestamp descending
    return query.order_by(database.Alert.timestamp.desc()).all()

@app.get("/api/alerts/{alert_id}")
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(database.Alert).filter(database.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # If explanation is not generated yet, generate it using AI or fallbacks
    if not alert.explanation:
        gemini_key_setting = db.query(database.SystemSetting).filter(database.SystemSetting.key == "GEMINI_API_KEY").first()
        api_key = gemini_key_setting.value if gemini_key_setting else None
        
        ai_data = agents_engine.explain_threat_with_ai(
            alert.category, alert.title, alert.description, alert.details_json, api_key
        )
        alert.explanation = ai_data["explanation"]
        alert.recommendations = ai_data["recommendations"]
        db.commit()
        db.refresh(alert)
        
    return alert

@app.post("/api/alerts/{alert_id}/action")
def execute_alert_action(alert_id: int, req: ActionRequest, db: Session = Depends(get_db)):
    alert = db.query(database.Alert).filter(database.Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if req.action in ["resolve", "isolate", "quarantine"]:
        alert.status = "resolved"
    elif req.action == "ignore":
        alert.status = "suppressed"
    
    db.commit()
    return {"message": f"Action '{req.action}' completed on alert {alert_id}", "status": alert.status}

@app.post("/api/alerts/simulate")
def simulate_new_threat(db: Session = Depends(get_db)):
    """
    Simulates a live threat intrusion and updates the active alerts list.
    """
    threats = [
        {
            "title": "Abnormal Data Exfiltration Detected",
            "description": "High volume outbound connection to unrecognized DNS endpoint 'malicious-data-drop.xyz' on Port 443.",
            "category": "Network",
            "agent": "Network Threat Detection Agent",
            "risk_score": 82.0,
            "severity": "High",
            "source": "database-srv-01 (IP: 10.0.2.14)",
            "details": {"destination_ip": "198.51.100.45", "destination_host": "malicious-data-drop.xyz", "bytes_transferred": 145000000, "protocol": "HTTPS"}
        },
        {
            "title": "Decoy Honeypot Credentials Accessed",
            "description": "Honeytoken AWS Access Key leaked on Github was activated by an unauthorized host from China.",
            "category": "Deception",
            "agent": "Deception & Honeypot Agent",
            "risk_score": 95.0,
            "severity": "Critical",
            "source": "honeypot-agent",
            "details": {"access_key_id": "AKIAIOSFODNN7HONEY", "source_ip": "222.186.30.12", "location": "Nanjing, China", "action_attempted": "sts:GetCallerIdentity"}
        },
        {
            "title": "Shadow API Access Warning",
            "description": "Unregistered API endpoint '/api/v2/dev-test' is receiving HTTP requests containing sensitive SQL syntax.",
            "category": "API Security",
            "agent": "API Security Agent",
            "risk_score": 75.0,
            "severity": "High",
            "source": "shadow-api-detector",
            "details": {"url": "http://api.sentinel.ai/api/v2/dev-test", "request_method": "POST", "payload_snippet": "UNION SELECT username, password_hash FROM users"}
        },
        {
            "title": "Typosquatted Brand Identity Leak",
            "description": "Exposed developer configuration repository leaked on public pasteboard mentioning internal subnet architectures.",
            "category": "Dark Web",
            "agent": "Dark Web Monitoring Agent",
            "risk_score": 64.0,
            "severity": "Medium",
            "source": "darkweb-paste-scanner",
            "details": {"site": "Pastebin", "leaked_files": "sentinel-gcp-init.sh", "matched_keywords": ["sentinel.ai", "gcp-master-keys"]}
        }
    ]
    
    t = random.choice(threats)
    new_alert = database.Alert(
        title=t["title"],
        description=t["description"],
        category=t["category"],
        agent=t["agent"],
        risk_score=t["risk_score"],
        severity=t["severity"],
        source=t["source"],
        status="active",
        timestamp=datetime.datetime.utcnow(),
        details_json=json.dumps(t["details"])
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return {"message": "Threat alert simulated successfully", "alert": new_alert}

# -----------------
# Vulnerability Routes
# -----------------

@app.get("/api/vulnerabilities")
def get_vulnerabilities(db: Session = Depends(get_db)):
    return db.query(database.Vulnerability).order_by(database.Vulnerability.cvss_score.desc()).all()

@app.post("/api/vulnerabilities/{vuln_id}/patch")
def patch_vulnerability(vuln_id: int, db: Session = Depends(get_db)):
    vuln = db.query(database.Vulnerability).filter(database.Vulnerability.id == vuln_id).first()
    if not vuln:
        raise HTTPException(status_code=404, detail="Vulnerability not found")
    
    vuln.patch_status = "applied"
    vuln.status = "resolved"
    db.commit()
    return {"message": f"Patch applied successfully for {vuln.cve_id}", "vulnerability": vuln}

# -----------------
# Compliance Routes
# -----------------

@app.get("/api/compliance")
def get_compliance(db: Session = Depends(get_db)):
    return db.query(database.ComplianceControl).all()

@app.post("/api/compliance/report")
def generate_audit_report(db: Session = Depends(get_db)):
    controls = db.query(database.ComplianceControl).all()
    
    compliant_count = sum(1 for c in controls if c.status == "compliant")
    gap_count = sum(1 for c in controls if c.status == "gap")
    
    total = len(controls)
    pass_rate = (compliant_count / total * 100) if total > 0 else 100
    
    report_data = {
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "summary": {
            "total_controls": total,
            "compliant_controls": compliant_count,
            "gap_controls": gap_count,
            "pass_rate": f"{pass_rate:.1f}%",
            "auditor_status": "Ready for External Audit" if gap_count == 0 else "Action Required - Gaps Identified"
        },
        "gaps_identified": [
            {"framework": c.framework, "control_id": c.control_id, "title": c.title, "remediation": c.evidence}
            for c in controls if c.status == "gap"
        ]
    }
    return report_data

# -----------------
# AI Assistant Route
# -----------------

@app.post("/api/assistant/chat")
def chat_assistant(req: ChatRequest, db: Session = Depends(get_db)):
    gemini_key_setting = db.query(database.SystemSetting).filter(database.SystemSetting.key == "GEMINI_API_KEY").first()
    api_key = gemini_key_setting.value if gemini_key_setting else None
    
    response_text = agents_engine.run_ai_chat_assistant(req.message, req.history, api_key)
    return {"response": response_text}

# -----------------
# V2.0 Agent Direct Modules
# -----------------

@app.post("/api/agents/threat-hunt")
def trigger_threat_hunt(req: ThreatHuntRequest, db: Session = Depends(get_db)):
    gemini_key_setting = db.query(database.SystemSetting).filter(database.SystemSetting.key == "GEMINI_API_KEY").first()
    api_key = gemini_key_setting.value if gemini_key_setting else None
    
    results = agents_engine.run_threat_hunt(req.hypothesis, api_key)
    return results

@app.get("/api/agents/cloud-posture")
def get_cloud_posture(db: Session = Depends(get_db)):
    return agents_engine.run_cloud_posture_audit()

@app.get("/api/agents/api-security")
def get_api_security(db: Session = Depends(get_db)):
    return agents_engine.run_api_security_discovery()

@app.get("/api/agents/dark-web")
def get_dark_web(db: Session = Depends(get_db)):
    return agents_engine.run_dark_web_monitoring()

@app.get("/api/agents/deception")
def get_deception(db: Session = Depends(get_db)):
    return agents_engine.run_deception_honeypots()
