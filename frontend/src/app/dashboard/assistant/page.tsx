"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Bot, Send, User, RefreshCw, AlertTriangle, 
  Terminal, ShieldAlert, Cpu, CheckCircle, Search, Cloud, Globe, Key
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CloudPosture {
  id: number;
  provider: string;
  rule: string;
  severity: string;
  status: string;
  asset: string;
  details: string;
  recommendation: string;
}

interface ApiAsset {
  id: number;
  endpoint: string;
  status: string;
  severity: string;
  traffic_rate_1h: number;
  auth_method: string;
  data_exposed: string;
  remediation: string;
}

interface DarkWebLeak {
  id: number;
  source: string;
  type: string;
  leaked_item: string;
  details: string;
  date: string;
  severity: string;
  status: string;
}

export default function AIAssistant() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "### SentinelAI Cyber Analyst Online\nI am connected to all 16 autonomous agent nodes. Select a suggested topic below or ask me any question to analyze active alerts, review cloud postures, or generate incident timelines." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // V2.0 Agent states
  const [huntHypothesis, setHuntHypothesis] = useState("Scan for LSASS memory reading (T1003) persistence keys");
  const [huntResult, setHuntResult] = useState("");
  const [hunting, setHunting] = useState(false);
  
  const [cloudPosture, setCloudPosture] = useState<CloudPosture[]>([]);
  const [apiAssets, setApiAssets] = useState<ApiAsset[]>([]);
  const [darkWebLeaks, setDarkWebLeaks] = useState<DarkWebLeak[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "hunt" | "cloud" | "api" | "dark">("chat");

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load other agent info on page mount
  useEffect(() => {
    fetchCloudPosture();
    fetchApiSecurity();
    fetchDarkWeb();
  }, []);

  const fetchCloudPosture = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/agents/cloud-posture");
      if (res.ok) setCloudPosture(await res.json());
    } catch(e) {}
  };

  const fetchApiSecurity = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/agents/api-security");
      if (res.ok) setApiAssets(await res.json());
    } catch(e) {}
  };

  const fetchDarkWeb = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/agents/dark-web");
      if (res.ok) setDarkWebLeaks(await res.json());
    } catch(e) {}
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error();
      }
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "### System Warning\nUnable to reach the Gemini AI Assistant engine. Please confirm backend server status in console." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunHunt = async () => {
    if (!huntHypothesis.trim()) return;
    setHunting(true);
    setHuntResult("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/agents/threat-hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hypothesis: huntHypothesis })
      });
      if (res.ok) {
        const data = await res.json();
        setHuntResult(data.results);
      }
    } catch (e) {
      setHuntResult("### Error\nFailed to initialize Threat Hunting subprocess.");
    } finally {
      setHunting(false);
    }
  };

  const suggestedQuestions = [
    "What are the containment steps for a Ransomware attack?",
    "Review open compliance gaps for SOC 2 Framework",
    "List shadow APIs discovered by the API Security Agent",
    "How do we configure honeypot honeytokens in git repos?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-10rem)] overflow-hidden">
      
      {/* Agent Selector Sidebar Tabs */}
      <div className="cyber-glass p-5 rounded-2xl space-y-2 lg:col-span-1 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-2">
          <div className="border-b border-white/5 pb-3 mb-2">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Multi-Agent Console</h3>
            <p className="text-[9px] text-cyber-blue font-mono">Select active agent interface</p>
          </div>

          {[
            { id: "chat", name: "AI Analyst Copilot", icon: Bot, color: "text-cyber-cyan" },
            { id: "hunt", name: "Threat Hunter", icon: Search, color: "text-cyber-blue" },
            { id: "cloud", name: "Cloud Posture Audit", icon: Cloud, color: "text-cyber-amber" },
            { id: "api", name: "API Security Shield", icon: Globe, color: "text-purple-400" },
            { id: "dark", name: "Dark Web Monitor", icon: Key, color: "text-cyber-crimson" },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono border transition duration-200 cursor-pointer ${
                  activeTab === tab.id 
                    ? "bg-cyber-blue/15 border-cyber-cyan/40 text-white font-bold" 
                    : "bg-cyber-navy/30 border-white/5 text-gray-400 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.color}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-cyber-blue/5 border border-cyber-blue/15 rounded-xl font-mono text-[10px] text-gray-500 leading-normal">
          <span className="text-cyber-cyan font-bold uppercase block mb-1">Agent Sync Status:</span>
          All 16 nodes are streaming system heartbeats to memory storage.
        </div>
      </div>

      {/* Main Tab Panel */}
      <div className="cyber-glass rounded-2xl lg:col-span-3 flex flex-col justify-between overflow-hidden relative">
        
        {/* Tab 1: AI Assistant Chat */}
        {activeTab === "chat" && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-22rem)]">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex gap-3 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                    msg.role === "user" 
                      ? "bg-cyber-blue/20 border-cyber-cyan text-cyber-cyan" 
                      : "bg-cyber-cyan/15 border-cyber-cyan/40 text-cyber-cyan pulse-cyber"
                  }`}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`p-4 rounded-xl text-xs font-mono leading-relaxed border ${
                    msg.role === "user"
                      ? "bg-cyber-blue/10 border-cyber-cyan/30 text-white"
                      : "bg-cyber-navy/80 border-white/5 text-gray-300"
                  }`}>
                    <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center animate-spin">
                    <RefreshCw className="w-4 h-4 text-cyber-cyan" />
                  </div>
                  <div className="p-3 bg-cyber-navy/40 border border-white/5 rounded-xl text-xs font-mono text-gray-500">
                    Analyst is correlating agent security maps...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts & Input Area */}
            <div className="p-4 bg-cyber-navy/30 border-t border-white/5 space-y-4 shrink-0">
              {/* Suggestions */}
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 bg-cyber-bg border border-white/5 text-[10px] font-mono text-gray-400 rounded-lg hover:border-cyber-cyan hover:text-white transition duration-200 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }} 
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask the AI SOC Analyst about system states or incident containment..."
                  className="flex-1 bg-cyber-bg border border-cyber-blue/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-cyan font-mono transition"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 bg-gradient-to-r from-cyber-blue to-cyber-cyan text-cyber-bg font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,255,240,0.3)] transition duration-200 flex items-center justify-center disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* Tab 2: Threat Hunting Agent */}
        {activeTab === "hunt" && (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white font-mono uppercase">Threat Hunting Console</h3>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">Run hypothesis-driven scans mapped to MITRE ATT&CK vectors</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-gray-400 uppercase">Input Hunt Hypothesis</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={huntHypothesis}
                    onChange={(e) => setHuntHypothesis(e.target.value)}
                    placeholder="Enter security hypothesis (e.g. Scan for credential dump files)..."
                    className="flex-1 bg-cyber-bg border border-cyber-blue/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-cyan font-mono transition"
                  />
                  <button
                    onClick={handleRunHunt}
                    disabled={hunting}
                    className="px-6 py-2 bg-cyber-cyan text-cyber-bg font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,255,240,0.3)] transition font-mono text-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {hunting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    RUN HUNT
                  </button>
                </div>
              </div>

              {huntResult ? (
                <div className="p-5 bg-cyber-bg rounded-xl border border-white/5 space-y-3 font-mono text-xs text-gray-300 leading-relaxed max-h-[300px] overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: huntResult.replace(/\n/g, "<br/>") }} />
                </div>
              ) : hunting ? (
                <div className="p-12 text-center text-xs font-mono text-gray-500 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyber-cyan" />
                  Correlating system registries, log archives, and active file handles...
                </div>
              ) : (
                <div className="p-12 text-center text-xs font-mono text-gray-500 border border-dashed border-white/5 rounded-xl">
                  Submit a security hypothesis above to audit logs and find indicators of compromise (IOCs).
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Cloud Posture Audit */}
        {activeTab === "cloud" && (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="border-b border-white/5 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">Cloud Security Posture (CIS Audit)</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Auditing GCP, AWS, and Azure configuration templates</p>
              </div>
              <button 
                onClick={fetchCloudPosture}
                className="p-1.5 bg-white/5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition duration-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {cloudPosture.map((rule) => (
                <div 
                  key={rule.id}
                  className={`p-4 rounded-xl border font-mono text-xs flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                    rule.status === "pass" 
                      ? "bg-cyber-navy/40 border-white/5" 
                      : "bg-cyber-crimson/5 border-cyber-crimson/25"
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 bg-cyber-blue/15 text-cyber-cyan border border-cyber-cyan/20 rounded font-bold uppercase text-[9px]">
                        {rule.provider}
                      </span>
                      <span className={`px-2 py-0.5 rounded uppercase font-bold text-[8px] ${
                        rule.severity === "Critical" ? "bg-cyber-crimson/15 text-cyber-crimson animate-pulse" : "bg-cyber-amber/15 text-cyber-amber"
                      }`}>
                        {rule.severity}
                      </span>
                      <h4 className="text-sm font-bold text-white">{rule.rule}</h4>
                    </div>
                    <p className="text-gray-400 leading-snug">{rule.details}</p>
                    <p className="text-[11px] text-cyber-cyan pt-1">
                      <strong>Remediation:</strong> {rule.recommendation}
                    </p>
                  </div>

                  <div className="shrink-0 pt-1">
                    <span className={`px-2.5 py-1 rounded font-bold uppercase text-[9px] ${
                      rule.status === "pass" 
                        ? "bg-cyber-emerald/15 text-cyber-emerald" 
                        : "bg-cyber-crimson/15 text-cyber-crimson pulse-cyber"
                    }`}>
                      {rule.status === "pass" ? "Passed" : "Failed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: API Security Shield */}
        {activeTab === "api" && (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="border-b border-white/5 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">Shadow API Inventory Scanner</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Discovered shadow, outdated, and unauthenticated endpoints</p>
              </div>
              <button 
                onClick={fetchApiSecurity}
                className="p-1.5 bg-white/5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition duration-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {apiAssets.map((api) => (
                <div 
                  key={api.id}
                  className="p-4 bg-cyber-navy/40 border border-white/5 rounded-xl font-mono text-xs space-y-3"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-white font-bold text-sm bg-cyber-bg px-2.5 py-1 border border-white/5 rounded">
                        {api.endpoint}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[8px] ${
                        api.status === "shadow" ? "bg-cyber-crimson/15 text-cyber-crimson pulse-cyber" : "bg-cyber-emerald/15 text-cyber-emerald"
                      }`}>
                        {api.status} asset
                      </span>
                    </div>
                    <span className="text-gray-400 text-[10px]">Traffic (1h): <strong className="text-white">{api.traffic_rate_1h} req</strong></span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-cyber-bg/40 rounded-lg border border-white/5 text-[11px] text-gray-400">
                    <div>
                      <span>Authentication:</span>
                      <p className="text-white font-semibold mt-0.5">{api.auth_method}</p>
                    </div>
                    <div>
                      <span>Exposed Fields:</span>
                      <p className="text-cyber-crimson font-semibold mt-0.5 truncate">{api.data_exposed}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-cyber-cyan leading-snug">
                    <strong>Remediation playbook:</strong> {api.remediation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Dark Web Monitoring */}
        {activeTab === "dark" && (
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="border-b border-white/5 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white font-mono uppercase">Dark Web Scraper Logs</h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Mentions of organization domains, code signatures, and admin logins</p>
              </div>
              <button 
                onClick={fetchDarkWeb}
                className="p-1.5 bg-white/5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition duration-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {darkWebLeaks.map((leak) => (
                <div 
                  key={leak.id}
                  className="p-4 bg-cyber-navy/40 border border-cyber-blue/15 hover:border-cyber-blue/35 rounded-xl font-mono text-xs space-y-3 transition duration-150"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-cyber-crimson/15 text-cyber-crimson border border-cyber-crimson/30 rounded uppercase text-[9px] font-bold">
                        {leak.type}
                      </span>
                      <h4 className="text-sm font-bold text-white">{leak.source}</h4>
                    </div>
                    <span className="text-gray-500 text-[10px]">{leak.date}</span>
                  </div>

                  <p className="text-gray-400 leading-normal">
                    Exposed item: <strong className="text-white">{leak.leaked_item}</strong>
                  </p>
                  <p className="text-gray-500 leading-normal text-[11px] p-3 bg-cyber-bg/50 rounded border border-white/5">
                    {leak.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
