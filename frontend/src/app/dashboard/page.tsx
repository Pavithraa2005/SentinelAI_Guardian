"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, Shield, 
  ArrowRight, Activity, Terminal, ExternalLink, Bot, CheckCircle
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

interface Alert {
  id: number;
  title: string;
  description: string;
  category: string;
  agent: string;
  risk_score: number;
  severity: string;
  status: string;
  source: string;
  timestamp: string;
}

export default function SOCDashboard() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState(85);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
        
        // Dynamic security score based on active alerts
        const activeAlerts = data.filter((a: Alert) => a.status === "active");
        let scorePenalty = 0;
        activeAlerts.forEach((a: Alert) => {
          if (a.severity === "Critical") scorePenalty += 15;
          else if (a.severity === "High") scorePenalty += 8;
          else if (a.severity === "Medium") scorePenalty += 3;
        });
        setSecurityScore(Math.max(35, 100 - scorePenalty));
      }
    } catch (e) {
      console.error("Error loading alerts from backend:", e);
      // Mock fallback data for rendering offline
      setAlerts([
        {
          id: 1,
          title: "Suspicious Remote SSH Login Attempt",
          description: "Multiple failed login attempts followed by a successful login from Lithuanian IP.",
          category: "UBA",
          agent: "User Behavior Analytics Agent",
          risk_score: 85.0,
          severity: "High",
          status: "active",
          source: "admin (IP: 185.220.101.5)",
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          title: "Massive Encryption Activity Detected",
          description: "High frequency of file modification in /var/www/uploads.",
          category: "Ransomware",
          agent: "Ransomware Detection Agent",
          risk_score: 98.0,
          severity: "Critical",
          status: "active",
          source: "prod-file-server",
          timestamp: new Date().toISOString()
        }
      ]);
      setSecurityScore(65);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Listen for custom trigger event from layout simulation
    window.addEventListener("refresh-alerts", fetchAlerts);
    return () => {
      window.removeEventListener("refresh-alerts", fetchAlerts);
    };
  }, []);

  const chartData = [
    { name: "Mon", threats: 12, resolved: 10 },
    { name: "Tue", threats: 19, resolved: 15 },
    { name: "Wed", threats: 8, resolved: 7 },
    { name: "Thu", threats: 15, resolved: 14 },
    { name: "Fri", threats: 28, resolved: 22 },
    { name: "Sat", threats: 10, resolved: 9 },
    { name: "Sun", threats: 14, resolved: 12 },
  ];

  const categoryBreakdown = [
    { name: "UBA", value: 8, color: "#00D4FF" },
    { name: "Phishing", value: 15, color: "#00FFF0" },
    { name: "Ransomware", value: 3, color: "#FF2E63" },
    { name: "Network", value: 12, color: "#FF9F1C" },
    { name: "API Sec", value: 5, color: "#a855f7" }
  ];

  const activeAgents = [
    { name: "Phishing Agent", task: "Inbox Scanner", state: "monitoring", color: "bg-cyber-cyan" },
    { name: "Ransomware Shield", task: "FIM Driver", state: "monitoring", color: "bg-cyber-blue" },
    { name: "Network Sensor", task: "Flow Analysis", state: "investigating", color: "bg-cyber-amber" },
    { name: "Honeypot Warden", task: "Decoy Monitors", state: "standby", color: "bg-gray-500" },
    { name: "Cloud Posture Auditor", task: "API Poller", state: "monitoring", color: "bg-cyber-cyan" }
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Security Score Gauge */}
        <div className="cyber-glass p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden lg:col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-blue/5 rounded-full blur-xl"></div>
          <div>
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Corporate Security Posture</h3>
            <p className="text-[10px] text-cyber-blue font-mono mt-0.5">Real-time Anomaly Index</p>
          </div>
          
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                <circle cx="64" cy="64" r="54" 
                        stroke={securityScore > 80 ? "#2ECC71" : securityScore > 60 ? "#FF9F1C" : "#FF2E63"} 
                        strokeWidth="8" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 54} 
                        strokeDashoffset={2 * Math.PI * 54 * (1 - securityScore / 100)} 
                        strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white">{securityScore}</span>
                <span className="text-[10px] font-mono text-gray-400">/ 100</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className={`text-xs font-mono font-semibold ${
                securityScore > 80 ? "text-cyber-emerald" : securityScore > 60 ? "text-cyber-amber" : "text-cyber-crimson"
              }`}>
                {securityScore > 80 ? "SYSTEM SECURE" : securityScore > 60 ? "ELEVATED RISK" : "CRITICAL BREACH STATE"}
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-gray-400 border-t border-white/5 pt-2 flex justify-between">
            <span>Threat Penalty:</span>
            <span className="text-cyber-crimson">-{100 - securityScore} pts</span>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="cyber-glass p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Attack Anomaly Trends</h3>
              <p className="text-[10px] text-cyber-cyan font-mono mt-0.5">Ingested Alert volume vs Remediation Rate</p>
            </div>
            <span className="px-2 py-0.5 bg-cyber-blue/10 border border-cyber-blue/30 rounded text-[9px] font-mono text-cyber-blue">
              LIVE TELEMETRY
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#121826", borderColor: "rgba(0,212,255,0.25)" }} labelClassName="text-white text-xs" />
                <Area type="monotone" dataKey="threats" stroke="#00D4FF" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="cyber-glass p-6 rounded-2xl lg:col-span-1 space-y-4">
          <div>
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Classification Index</h3>
            <p className="text-[10px] text-cyber-blue font-mono mt-0.5">Alert distribution by category</p>
          </div>

          <div className="h-44 w-full flex items-center gap-3">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 0, right: 10, left: -30, bottom: 0 }}>
                  <XAxis type="number" stroke="#9ca3af" fontSize={8} hide />
                  <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={9} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#121826", borderColor: "rgba(0,255,240,0.25)" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* Live Threat Feed & Agent Status Sidepanel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Alerts Feed */}
        <div className="cyber-glass p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyber-crimson pulse-cyber" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Live Incident Alerts Feed</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">Total Alerts: {alerts.length}</span>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center text-sm font-mono text-gray-500">
              Initializing AI Decryption streams...
            </div>
          ) : alerts.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-white/5 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-cyber-emerald" />
              <p className="text-xs font-mono text-gray-400">No active incidents detected.</p>
              <p className="text-[10px] text-gray-500">Systems are currently protected by AI Guardian.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-4 rounded-xl border transition duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    alert.status === "resolved" 
                      ? "bg-cyber-navy/20 border-white/5 opacity-60" 
                      : alert.severity === "Critical" 
                        ? "bg-cyber-crimson/5 border-cyber-crimson/30 hover:border-cyber-crimson/60"
                        : alert.severity === "High"
                          ? "bg-cyber-amber/5 border-cyber-amber/30 hover:border-cyber-amber/60"
                          : "bg-cyber-navy/60 border-cyber-blue/15 hover:border-cyber-blue/45"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                        alert.severity === "Critical" 
                          ? "bg-cyber-crimson/15 text-cyber-crimson" 
                          : alert.severity === "High"
                            ? "bg-cyber-amber/15 text-cyber-amber"
                            : "bg-cyber-blue/15 text-cyber-cyan"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="px-2 py-0.5 border border-white/10 rounded text-[9px] font-mono text-gray-400 uppercase">
                        {alert.category}
                      </span>
                      {alert.status === "resolved" && (
                        <span className="px-2 py-0.5 bg-cyber-emerald/15 text-cyber-emerald rounded text-[9px] font-mono uppercase font-semibold">
                          Resolved
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white font-mono">{alert.title}</h4>
                    <p className="text-xs text-gray-400 leading-snug">{alert.description}</p>
                    <div className="flex gap-4 text-[10px] font-mono text-gray-500 pt-1">
                      <span>Source: <strong className="text-gray-300 font-normal">{alert.source}</strong></span>
                      <span>Agent: <strong className="text-cyber-blue font-normal">{alert.agent}</strong></span>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center">
                    <button
                      onClick={() => router.push(`/dashboard/threats?id=${alert.id}`)}
                      className="px-4 py-2 border border-cyber-blue/35 text-cyber-cyan text-xs font-mono rounded-lg hover:bg-cyber-blue/15 hover:text-white transition duration-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      INVESTIGATE <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Agent Status Side panel */}
        <div className="cyber-glass p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Terminal className="w-5 h-5 text-cyber-cyan" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">AI Agent Nodes (Active)</h3>
          </div>

          <div className="space-y-4">
            {activeAgents.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-cyber-navy/40 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${agent.color} pulse-cyber`}></span>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{agent.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{agent.task}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                  agent.state === "monitoring" 
                    ? "bg-cyber-cyan/15 text-cyber-cyan"
                    : agent.state === "investigating"
                      ? "bg-cyber-amber/15 text-cyber-amber"
                      : "bg-gray-500/15 text-gray-400"
                }`}>
                  {agent.state}
                </span>
              </div>
            ))}
            
            {/* Quick Agent Assist box */}
            <div className="p-4 bg-cyber-blue/5 border border-cyber-blue/20 rounded-xl space-y-2 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-cyber-cyan text-xs font-bold font-mono">
                <Bot className="w-4 h-4" /> AI SOC ANALYST ADVICE
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                "Critical ransomware encryption indicator triggered on 'prod-file-server'. Ensure administrative hosts have disconnected target SMB volumes."
              </p>
              <button 
                onClick={() => router.push("/dashboard/assistant")}
                className="mt-1 text-[10px] text-cyber-cyan font-mono flex items-center gap-1 hover:underline cursor-pointer"
              >
                Open Virtual Assistant <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
