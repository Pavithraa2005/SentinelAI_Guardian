"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowLeft, 
  Terminal, ShieldCheck as CheckIcon, Play, RefreshCw, Info, HelpCircle
} from "lucide-react";

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
  details_json: string;
  explanation?: string;
  recommendations?: string;
}

// Inner component that handles search parameters
function ThreatDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const alertId = searchParams.get("id");

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mitigateSuccess, setMitigateSuccess] = useState("");
  const [verificationChecked, setVerificationChecked] = useState<boolean[]>([false, false, false]);

  const loadAlerts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
        
        // If an ID is provided, set that alert, otherwise default to first
        if (alertId) {
          fetchSingleAlert(parseInt(alertId));
        } else if (data.length > 0) {
          fetchSingleAlert(data[0].id);
        } else {
          setLoading(false);
        }
      }
    } catch (e) {
      console.error("Failed to load alerts list", e);
      setLoading(false);
    }
  };

  const fetchSingleAlert = async (id: number) => {
    setLoading(true);
    setMitigateSuccess("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/alerts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAlert(data);
      }
    } catch (e) {
      console.error("Failed to fetch alert detail", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [alertId]);

  const handleAction = async (actionType: string) => {
    if (!selectedAlert) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/alerts/${selectedAlert.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType })
      });
      if (res.ok) {
        setMitigateSuccess(`Action '${actionType}' completed. Alert state updated.`);
        // Reload details
        fetchSingleAlert(selectedAlert.id);
      }
    } catch (e) {
      console.error("Failed to execute alert action", e);
    } finally {
      setActionLoading(false);
    }
  };

  const parseDetails = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      return {};
    }
  };

  if (loading && !selectedAlert) {
    return (
      <div className="h-96 flex flex-col items-center justify-center font-mono text-gray-400">
        <RefreshCw className="w-8 h-8 text-cyber-cyan animate-spin mb-4" />
        DECRYPTING THREAT FLOW LOGS...
      </div>
    );
  }

  const details = selectedAlert ? parseDetails(selectedAlert.details_json) : {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Sidebar - Alert Selector */}
      <div className="cyber-glass p-5 rounded-2xl space-y-4 lg:col-span-1 h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider">Active Security Incidents</h3>
          <span className="text-[10px] font-mono text-cyber-cyan">{alerts.length} Registered</span>
        </div>
        
        <div className="space-y-2">
          {alerts.map((al) => (
            <button
              key={al.id}
              onClick={() => {
                router.push(`/dashboard/threats?id=${al.id}`);
                fetchSingleAlert(al.id);
              }}
              className={`w-full text-left p-3.5 rounded-xl border font-mono transition duration-200 ${
                selectedAlert?.id === al.id 
                  ? "bg-cyber-blue/15 border-cyber-cyan text-white" 
                  : "bg-cyber-navy/40 border-white/5 hover:border-cyber-blue/40 text-gray-400"
              }`}
            >
              <div className="flex justify-between items-center text-[9px] mb-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                  al.severity === "Critical" ? "bg-cyber-crimson/15 text-cyber-crimson" : al.severity === "High" ? "bg-cyber-amber/15 text-cyber-amber" : "bg-cyber-blue/15 text-cyber-cyan"
                }`}>{al.severity}</span>
                <span>{al.category}</span>
              </div>
              <h4 className="text-xs font-bold truncate text-white">{al.title}</h4>
              <p className="text-[10px] text-gray-500 truncate mt-1">{al.source}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Details and Analysis Panel */}
      {selectedAlert ? (
        <div className="lg:col-span-2 space-y-6 overflow-y-auto h-[calc(100vh-12rem)] pr-1">
          
          {/* Header Panel */}
          <div className="cyber-glass p-6 rounded-2xl space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg border ${
                  selectedAlert.severity === "Critical" ? "bg-cyber-crimson/10 border-cyber-crimson/30" : "bg-cyber-amber/10 border-cyber-amber/30"
                }`}>
                  <ShieldAlert className={`w-6 h-6 ${selectedAlert.severity === "Critical" ? "text-cyber-crimson" : "text-cyber-amber"}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">{selectedAlert.title}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">Detected by {selectedAlert.agent}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-400 font-mono">RISK INDEX</div>
                <div className="text-2xl font-extrabold text-cyber-cyan font-mono">{selectedAlert.risk_score} <span className="text-xs font-normal text-gray-500">/ 100</span></div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-cyber-navy/40 rounded-xl border border-white/5 font-mono text-[11px] text-gray-400">
              <div>
                <span>AFFECTED ASSET:</span>
                <p className="text-white font-semibold mt-0.5 truncate">{selectedAlert.source}</p>
              </div>
              <div>
                <span>SEVERITY SCALE:</span>
                <p className={`font-semibold mt-0.5 ${
                  selectedAlert.severity === "Critical" ? "text-cyber-crimson" : selectedAlert.severity === "High" ? "text-cyber-amber" : "text-cyber-cyan"
                }`}>{selectedAlert.severity}</p>
              </div>
              <div>
                <span>STATUS:</span>
                <p className="text-white font-semibold mt-0.5 uppercase">{selectedAlert.status}</p>
              </div>
              <div>
                <span>TIMESTAMP:</span>
                <p className="text-white font-semibold mt-0.5">{new Date(selectedAlert.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>

          {/* Incident Timeline */}
          <div className="cyber-glass p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-mono text-cyber-cyan uppercase tracking-wider">Autonomous Response Timeline</h4>
            <div className="relative pl-6 border-l border-cyber-blue/20 space-y-6">
              
              {/* Point 1 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-cyber-cyan border-2 border-cyber-bg flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-cyber-bg rounded-full"></span>
                </span>
                <div className="font-mono text-xs text-gray-400">00:00:01 - DETECTION</div>
                <p className="text-xs text-white mt-1">Alert triggered on source telemetry by {selectedAlert.agent}.</p>
              </div>

              {/* Point 2 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-cyber-blue border-2 border-cyber-bg flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-cyber-bg rounded-full"></span>
                </span>
                <div className="font-mono text-xs text-gray-400">00:00:03 - DATA CORRELATION</div>
                <p className="text-xs text-white mt-1">Threat Intelligence Agent matched patterns with MITRE ATT&CK.</p>
              </div>

              {/* Point 3 */}
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-cyber-cyan border-2 border-cyber-bg flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-cyber-bg rounded-full animate-ping"></span>
                </span>
                <div className="font-mono text-xs text-gray-400">00:00:05 - AI EXPLANATION GENERATED</div>
                <p className="text-xs text-white mt-1">Incident Response Agent formulated mitigation playbook via Gemini LLM.</p>
              </div>
              
              {/* Point 4 */}
              <div className="relative">
                <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-cyber-bg flex items-center justify-center ${
                  selectedAlert.status === "resolved" ? "bg-cyber-emerald" : "bg-gray-500"
                }`}>
                  {selectedAlert.status === "resolved" && <span className="w-1.5 h-1.5 bg-cyber-bg rounded-full"></span>}
                </span>
                <div className="font-mono text-xs text-gray-400">PENDING - CONTAINMENT STATE</div>
                <p className="text-xs text-white mt-1">
                  {selectedAlert.status === "resolved" 
                    ? "Containment actions successfully completed." 
                    : "Awaiting human analyst authorization to isolate asset."}
                </p>
              </div>

            </div>
          </div>

          {/* AI Explanation Details */}
          <div className="cyber-glass p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-mono text-cyber-cyan uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> Gemini AI Threat Explanation
            </h4>
            
            {loading ? (
              <div className="text-xs font-mono text-gray-500">Querying Gemini API...</div>
            ) : (
              <div className="prose prose-invert max-w-none text-xs text-gray-300 leading-relaxed space-y-3 font-mono">
                {selectedAlert.explanation ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedAlert.explanation.replace(/\n/g, "<br/>") }} />
                ) : (
                  <p>No explanation currently computed for this incident.</p>
                )}
              </div>
            )}
          </div>

          {/* Action Center */}
          <div className="cyber-glass p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-mono text-cyber-cyan uppercase tracking-wider">Containment & Remediation Actions</h4>
            
            {mitigateSuccess && (
              <div className="p-3 bg-cyber-emerald/15 border border-cyber-emerald/30 text-cyber-emerald text-xs rounded-lg font-mono">
                {mitigateSuccess}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              {selectedAlert.status === "resolved" ? (
                <div className="flex items-center gap-2 text-cyber-emerald font-mono text-xs">
                  <CheckIcon className="w-5 h-5 text-cyber-emerald" /> Mitigated. Host isolated / credentials revoked.
                </div>
              ) : (
                <>
                  {selectedAlert.category === "Ransomware" && (
                    <button
                      onClick={() => handleAction("isolate")}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-cyber-crimson text-white text-xs font-mono font-bold rounded-lg hover:shadow-[0_0_15px_rgba(255,46,99,0.3)] transition cursor-pointer"
                    >
                      ISOLATE HOST IMMEDIATELY
                    </button>
                  )}
                  {selectedAlert.category === "Phishing" && (
                    <button
                      onClick={() => handleAction("quarantine")}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-cyber-amber text-cyber-bg text-xs font-mono font-bold rounded-lg hover:shadow-[0_0_15px_rgba(255,159,28,0.3)] transition cursor-pointer"
                    >
                      QUARANTINE INCOMING EMAILS
                    </button>
                  )}
                  {selectedAlert.category === "UBA" && (
                    <button
                      onClick={() => handleAction("isolate")}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-cyber-crimson text-white text-xs font-mono font-bold rounded-lg hover:shadow-[0_0_15px_rgba(255,46,99,0.3)] transition cursor-pointer"
                    >
                      TERMINATE ADMIN SESSIONS
                    </button>
                  )}
                  {selectedAlert.category === "Dark Web" && (
                    <button
                      onClick={() => handleAction("quarantine")}
                      disabled={actionLoading}
                      className="px-5 py-2.5 bg-cyber-blue text-cyber-bg text-xs font-mono font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition cursor-pointer"
                    >
                      FORCE SYSTEM PASSWORD ROTATION
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleAction("resolve")}
                    disabled={actionLoading}
                    className="px-5 py-2.5 border border-cyber-cyan text-cyber-cyan text-xs font-mono rounded-lg hover:bg-cyber-cyan/10 transition cursor-pointer"
                  >
                    RESOLVE ALERT (MANUAL CLEAR)
                  </button>

                  <button
                    onClick={() => handleAction("ignore")}
                    disabled={actionLoading}
                    className="px-5 py-2.5 border border-white/10 text-gray-400 text-xs font-mono rounded-lg hover:bg-white/5 transition cursor-pointer"
                  >
                    SUPPRESS TELEMETRY
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="cyber-glass p-6 rounded-2xl space-y-4">
            <h4 className="text-xs font-mono text-cyber-cyan uppercase tracking-wider">Recovery Verification Checklist</h4>
            
            <div className="space-y-3 font-mono text-xs">
              {[
                "Verify file integrity and compile recent database backups",
                "Ensure target host registry configuration matches baseline",
                "Validate firewall rules blocks source threat IP address"
              ].map((item, idx) => (
                <label key={idx} className="flex items-center gap-3 text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verificationChecked[idx]}
                    onChange={(e) => {
                      const copy = [...verificationChecked];
                      copy[idx] = e.target.checked;
                      setVerificationChecked(copy);
                    }}
                    className="w-4 h-4 accent-cyber-cyan bg-cyber-bg border-cyber-blue/20 rounded"
                  />
                  <span className={verificationChecked[idx] ? "line-through text-gray-500" : ""}>{item}</span>
                </label>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="lg:col-span-2 cyber-glass p-12 rounded-2xl flex flex-col items-center justify-center text-center">
          <HelpCircle className="w-10 h-10 text-gray-500 mb-2" />
          <h3 className="font-mono text-sm text-white font-bold">No Alert Selected</h3>
          <p className="text-xs text-gray-400 max-w-sm mt-1">Select an incident from the sidepanel list to review logs and trigger containment procedures.</p>
        </div>
      )}

    </div>
  );
}

// Main page component with Suspense fallback wrapper
export default function ThreatAnalysis() {
  return (
    <Suspense fallback={
      <div className="h-96 flex flex-col items-center justify-center font-mono text-gray-400">
        <RefreshCw className="w-8 h-8 text-cyber-cyan animate-spin mb-4" />
        LOADING THREAT CONTROLLER...
      </div>
    }>
      <ThreatDetailsContent />
    </Suspense>
  );
}
