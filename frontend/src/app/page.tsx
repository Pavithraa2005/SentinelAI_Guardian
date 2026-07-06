"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Shield, Cpu, AlertTriangle, Terminal, Key, Database, 
  Activity, ArrowRight, Server, CheckCircle2, Lock, Globe 
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("sentinel123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Authentication failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      
      router.push("/dashboard");
    } catch (err: any) {
      // Fallback for demo when backend is starting or offline
      if (username === "analyst" && password === "sentinel123" || username === "admin") {
        localStorage.setItem("token", "mock-jwt-token-sentinel-ai");
        localStorage.setItem("username", username);
        localStorage.setItem("role", username === "admin" ? "admin" : "analyst");
        router.push("/dashboard");
      } else {
        setError(err.message || "Cannot connect to backend server");
      }
    } finally {
      setLoading(false);
    }
  };

  const agentsList = [
    { name: "Phishing Detection Agent", desc: "Analyzes emails, scans URLs, and detects malicious attachments.", cat: "Threat Detection" },
    { name: "Ransomware Detection Agent", desc: "Monitors abnormal file encryption and process execution loops.", cat: "Threat Detection" },
    { name: "User Behavior Analytics Agent", desc: "Monitors login activities and flags insider threats and compromised credentials.", cat: "Threat Detection" },
    { name: "Network Threat Agent", desc: "Inspects traffic packets, discovers anomalies, and blocks malicious IPs.", cat: "Threat Detection" },
    { name: "Threat Intelligence Agent", desc: "Correlates attack telemetry with MITRE ATT&CK patterns.", cat: "Threat Intelligence" },
    { name: "Incident Response Agent", desc: "Builds attack timelines and executes micro-isolation playbooks.", cat: "Response & Recovery" },
    { name: "Recovery Guidance Agent", desc: "Verifies backup integrity and guides step-by-step restoration.", cat: "Response & Recovery" },
    { name: "Executive Reporting Agent", desc: "Synthesizes security compliance audits into executive summaries.", cat: "Threat Intelligence" },
    { name: "Vulnerability Management Agent", desc: "Scans code libraries and system endpoints for active CVE exposures.", cat: "deception & posture" },
    { name: "Compliance Automation Agent", desc: "Maps infrastructure state to SOC 2, ISO 27001, GDPR, and HIPAA.", cat: "deception & posture" },
    { name: "Dark Web Monitoring Agent", desc: "Scrapes marketplaces and forums for leaked corporate keys and domains.", cat: "Threat Intelligence" },
    { name: "Deception & Honeypot Agent", desc: "Deploys decoy folders, assets, and honeytokens to detect lateral movement.", cat: "deception & posture" },
    { name: "Threat Hunting Agent", desc: "Runs proactive, hypothesis-driven security scans across active workloads.", cat: "Threat Detection" },
    { name: "Cloud Security Posture Agent", desc: "Audits GCP, AWS, and Azure resource groups against CIS benchmarks.", cat: "deception & posture" },
    { name: "API Security Agent", desc: "Discovers shadow APIs and enforces payload validation rules.", cat: "deception & posture" },
    { name: "AI Security Assistant", desc: "Conversational security copilot aiding security analysts with quick queries.", cat: "Response & Recovery" }
  ];

  return (
    <div className="relative min-h-screen cyber-grid bg-cyber-bg overflow-x-hidden flex flex-col justify-between">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-cyber-blue/15 py-4 px-6 md:px-12 flex justify-between items-center bg-cyber-navy/40 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyber-blue/10 border border-cyber-cyan/30 rounded-lg pulse-cyber">
            <Shield className="w-6 h-6 text-cyber-cyan" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-white">SENTINEL<span className="text-cyber-cyan">AI</span></h1>
            <p className="text-[10px] text-cyber-blue tracking-widest font-mono uppercase">Guardian Platform</p>
          </div>
        </div>
        <button 
          onClick={() => setShowLoginModal(true)} 
          className="relative px-5 py-2 overflow-hidden border border-cyber-cyan rounded-lg text-cyber-cyan font-mono hover:text-white transition duration-300 group"
        >
          <span className="absolute inset-0 bg-cyber-cyan/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
          ACCESS PORTAL
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-cyber-blue/30 rounded-full bg-cyber-navy/60 text-cyber-cyan text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyber-cyan pulse-cyber"></span>
            ACTIVE MULTI-AGENT SHIELD ONLINE
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            SentinelAI <span className="bg-gradient-to-r from-cyber-blue to-cyber-cyan bg-clip-text text-transparent">Guardian</span>
          </h2>
          <p className="text-3xl md:text-4xl font-light tracking-wide text-gray-300 font-mono">
            Predict. Protect. Respond.
          </p>
          <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            SentinelAI Guardian is an enterprise-grade multi-agent AI cybersecurity operations center. Powered by 16 autonomous agents, the platform detects threats in real-time, closes security gaps, maps compliance, and automates incident response.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowLoginModal(true)} 
              className="px-8 py-3.5 bg-gradient-to-r from-cyber-blue to-cyber-cyan text-cyber-bg font-bold rounded-lg hover:shadow-[0_0_20px_rgba(0,255,240,0.4)] hover:scale-[1.02] transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              LAUNCH CONSOLE <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#agents" 
              className="px-8 py-3.5 border border-white/10 hover:border-cyber-blue bg-cyber-navy/40 text-gray-300 font-mono rounded-lg hover:bg-cyber-navy/80 hover:text-white transition duration-300 flex items-center justify-center"
            >
              EXPLORE AI AGENTS
            </a>
          </div>
        </div>

        {/* Architecture Pipeline */}
        <section className="mt-20 w-full border border-cyber-blue/15 rounded-2xl p-6 md:p-8 bg-cyber-navy/40 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-2xl"></div>
          <h3 className="text-lg md:text-xl font-bold text-white mb-8 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyber-cyan" /> SentinelAI Threat Processing Architecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div className="cyber-glass p-4 rounded-xl text-center flex flex-col justify-between h-44 relative">
              <div className="text-xs text-cyber-cyan font-mono border-b border-cyber-cyan/20 pb-2 mb-2 uppercase">01. Ingestion</div>
              <p className="text-[13px] text-gray-400 leading-snug">VPC logs, Email streams, File system activity, Honeypot logs, Dark web dumps.</p>
              <div className="flex justify-center mt-3"><Server className="w-5 h-5 text-gray-400" /></div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center"><ArrowRight className="w-6 h-6 text-cyber-blue/40" /></div>

            {/* Step 2 */}
            <div className="cyber-glass p-4 rounded-xl text-center flex flex-col justify-between h-44 relative">
              <div className="text-xs text-cyber-blue font-mono border-b border-cyber-blue/20 pb-2 mb-2 uppercase">02. AI Monitoring</div>
              <p className="text-[13px] text-gray-400 leading-snug">16 autonomous agents analyze workloads, scan CVE databases, and track compliance.</p>
              <div className="flex justify-center mt-3"><Cpu className="w-5 h-5 text-cyber-blue" /></div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center"><ArrowRight className="w-6 h-6 text-cyber-blue/40" /></div>

            {/* Step 3 */}
            <div className="cyber-glass p-4 rounded-xl text-center flex flex-col justify-between h-44 relative border-cyber-cyan/30">
              <div className="text-xs text-cyber-cyan font-mono border-b border-cyber-cyan/20 pb-2 mb-2 uppercase">03. Response</div>
              <p className="text-[13px] text-gray-400 leading-snug">Dynamic incident response, host isolation, credential revocation, system restore.</p>
              <div className="flex justify-center mt-3"><Shield className="w-5 h-5 text-cyber-cyan" /></div>
            </div>
            
          </div>
        </section>

        {/* 16 Agents Grid */}
        <section id="agents" className="mt-24 w-full">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white">The Multi-Agent Core</h3>
            <p className="text-sm text-gray-400 mt-2">16 dedicated, specialized AI agents working continuously across the cyber defense lifecycle.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {agentsList.map((agent, i) => (
              <div key={i} className="cyber-glass p-5 rounded-xl flex flex-col justify-between hover:border-cyber-cyan/40 hover:shadow-[0_0_15px_rgba(0,255,240,0.05)] transition-all duration-300">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-0.5 border border-cyber-blue/30 rounded text-[9px] font-mono text-cyber-blue bg-cyber-blue/5 uppercase tracking-wider">
                      {agent.cat}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald pulse-cyber"></span>
                  </div>
                  <h4 className="text-sm font-semibold text-white font-mono">{agent.name}</h4>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{agent.desc}</p>
                </div>
                <div className="pt-4 flex justify-between items-center text-[10px] text-cyber-cyan font-mono">
                  <span>AGENT STATUS: ACTIVE</span>
                  <CheckCircle2 className="w-4.5 h-4.5 text-cyber-emerald" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyber-blue/10 py-6 text-center text-xs text-gray-500 bg-cyber-navy/20">
        <p>&copy; 2026 SentinelAI Guardian. Capstone Cybersecurity Project. All rights reserved.</p>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-cyber-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="w-full max-w-md cyber-glass rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Modal header */}
            <div className="bg-cyber-navy/80 p-6 border-b border-cyber-blue/20 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyber-cyan" />
                <h3 className="font-bold text-white tracking-wide">SENTINELAI SECURITY PORTAL</h3>
              </div>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-cyber-crimson/15 border border-cyber-crimson/30 text-cyber-crimson text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-gray-400 uppercase">Username</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required
                  className="w-full bg-cyber-bg border border-cyber-blue/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyber-cyan transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-gray-400 uppercase">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                  className="w-full bg-cyber-bg border border-cyber-blue/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyber-cyan transition"
                />
              </div>

              <div className="pt-2 text-[10px] text-gray-400 font-mono space-y-1">
                <div className="flex justify-between">
                  <span>DEMO USERNAME: <strong className="text-cyber-cyan">analyst</strong></span>
                  <span>PASSWORD: <strong className="text-cyber-cyan">sentinel123</strong></span>
                </div>
                <div className="flex justify-between">
                  <span>ADMIN USERNAME: <strong className="text-cyber-blue">admin</strong></span>
                  <span>PASSWORD: <strong className="text-cyber-blue">sentinel123</strong></span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-cyber-blue to-cyber-cyan text-cyber-bg font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,255,240,0.3)] transition duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "AUTHENTICATING..." : "ENTER CONSOLE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
