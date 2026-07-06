"use client";

import { useEffect, useState } from "react";
import { 
  FileText, ShieldCheck, AlertCircle, RefreshCw, 
  ArrowRight, Download, Eye, CheckSquare, ClipboardCopy 
} from "lucide-react";

interface Control {
  id: number;
  framework: string;
  control_id: string;
  title: string;
  description: string;
  status: string;
  evidence: string;
  last_checked: string;
}

interface AuditReport {
  generated_at: string;
  summary: {
    total_controls: number;
    compliant_controls: number;
    gap_controls: number;
    pass_rate: string;
    auditor_status: string;
  };
  gaps_identified: Array<{
    framework: string;
    control_id: string;
    title: string;
    remediation: string;
  }>;
}

export default function ComplianceCenter() {
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedFramework, setSelectedFramework] = useState("SOC 2");
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchControls = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/compliance");
      if (res.ok) {
        const data = await res.json();
        setControls(data);
      }
    } catch (e) {
      console.error("Failed to load compliance controls", e);
      // Fallback mocks
      setControls([
        {
          id: 1,
          framework: "SOC 2",
          control_id: "CC6.1",
          title: "Logical Access Controls",
          description: "Access to production systems is restricted to authorized personnel.",
          status: "compliant",
          evidence: "JWT token authentication validated.",
          last_checked: new Date().toISOString()
        },
        {
          id: 2,
          framework: "SOC 2",
          control_id: "CC6.3",
          title: "Vulnerability Management",
          description: "Vulnerability scans are executed regularly and high-risk findings patched.",
          status: "gap",
          evidence: "Last scan was 15 days ago. 3 critical CVEs remain open.",
          last_checked: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    setCopied(false);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/compliance/report", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      }
    } catch (e) {
      console.error("Failed to generate report", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredControls = controls.filter(c => c.framework === selectedFramework);
  const compliantCount = filteredControls.filter(c => c.status === "compliant").length;
  const totalCount = filteredControls.length;
  const passRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6">
      
      {/* Framework Selector Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-white/5 pb-4">
        {["SOC 2", "ISO 27001", "GDPR", "HIPAA"].map((fw) => (
          <button
            key={fw}
            onClick={() => {
              setSelectedFramework(fw);
              setReport(null); // Clear active report on framework switch
            }}
            className={`px-5 py-2.5 font-mono text-xs font-bold rounded-lg border transition duration-200 cursor-pointer ${
              selectedFramework === fw 
                ? "bg-cyber-blue/15 border-cyber-cyan text-cyber-cyan shadow-[0_0_10px_rgba(0,255,240,0.1)]" 
                : "bg-cyber-navy/40 border-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {fw} COMPLIANCE
          </button>
        ))}
      </div>

      {/* Score and Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Compliance Circle Chart */}
        <div className="cyber-glass p-6 rounded-2xl flex items-center justify-between col-span-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyber-blue/5 rounded-full blur-xl"></div>
          <div className="space-y-1">
            <h4 className="text-xs font-mono text-gray-400 uppercase">Framework Score</h4>
            <p className="text-xs text-gray-500 font-mono">Control Pass Ratio</p>
            <p className="text-[10px] text-cyber-blue font-mono uppercase mt-2">
              {compliantCount} OF {totalCount} CONTROLS MET
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
              <circle cx="40" cy="40" r="32" 
                      stroke={passRate > 80 ? "#2ECC71" : passRate > 50 ? "#FF9F1C" : "#FF2E63"} 
                      strokeWidth="6" fill="transparent" 
                      strokeDasharray={2 * Math.PI * 32} 
                      strokeDashoffset={2 * Math.PI * 32 * (1 - passRate / 100)} 
                      strokeLinecap="round" />
            </svg>
            <span className="absolute text-sm font-extrabold text-white font-mono">{passRate}%</span>
          </div>
        </div>

        {/* Evidence Status */}
        <div className="cyber-glass p-6 rounded-2xl col-span-1 space-y-2">
          <h4 className="text-xs font-mono text-gray-400 uppercase">Evidence Logging Status</h4>
          <p className="text-sm font-bold text-white font-mono flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-5 h-5 text-cyber-emerald" /> AUTOMATED AGENTS ONLINE
          </p>
          <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
            SentinelAI automatically logs VPC audit tracks and vulnerability database state files into the compliance database.
          </p>
        </div>

        {/* Actions Button */}
        <div className="cyber-glass p-6 rounded-2xl col-span-1 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-mono text-gray-400 uppercase">Executive Audits</h4>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Collect and map logs for compliance audits.</p>
          </div>
          
          <button
            onClick={generateReport}
            disabled={generating}
            className="w-full py-2.5 bg-gradient-to-r from-cyber-blue to-cyber-cyan text-cyber-bg font-bold rounded-lg hover:shadow-[0_0_15px_rgba(0,255,240,0.3)] transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4" /> 
            {generating ? "COMPILING AUDIT..." : "COMPILE AUDIT REPORT"}
          </button>
        </div>

      </div>

      {/* Audit Report Result Modal Overlay */}
      {report && (
        <div className="cyber-glass p-6 rounded-2xl border-cyber-cyan bg-cyber-navy/85 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 text-cyber-cyan">
              <Eye className="w-5 h-5" />
              <h3 className="font-bold text-sm font-mono uppercase tracking-wider">Compiled Audit Report Summary</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white/5 text-gray-300 border border-white/10 text-[10px] font-mono rounded hover:bg-white/10 flex items-center gap-1.5 transition cursor-pointer"
              >
                <ClipboardCopy className="w-3.5 h-3.5" /> 
                {copied ? "COPIED!" : "COPY JSON"}
              </button>
              <button
                onClick={() => setReport(null)}
                className="text-gray-400 hover:text-white font-bold font-mono text-xs cursor-pointer"
              >
                CLOSE
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-gray-400">
            <div className="p-4 bg-cyber-bg rounded-xl border border-white/5 space-y-2">
              <span className="text-cyber-cyan text-[10px] uppercase font-bold">Audit Metrics</span>
              <p>Generated At: <strong className="text-white">{new Date(report.generated_at).toLocaleString()}</strong></p>
              <p>Total Controls: <strong className="text-white">{report.summary.total_controls}</strong></p>
              <p>Compliant: <strong className="text-cyber-emerald">{report.summary.compliant_controls}</strong></p>
              <p>Gaps: <strong className="text-cyber-crimson">{report.summary.gap_controls}</strong></p>
              <p>Pass Ratio: <strong className="text-cyber-cyan">{report.summary.pass_rate}</strong></p>
            </div>

            <div className="p-4 bg-cyber-bg rounded-xl border border-white/5 space-y-2">
              <span className="text-cyber-cyan text-[10px] uppercase font-bold">Auditor Assessment</span>
              <p className={`text-sm font-bold uppercase mt-1 ${
                report.summary.gap_controls === 0 ? "text-cyber-emerald" : "text-cyber-amber pulse-cyber"
              }`}>{report.summary.auditor_status}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-2">
                {report.summary.gap_controls === 0 
                  ? "All verified controls comply with framework guidelines. Evidence documents are signed and sealed." 
                  : "Compliance gaps require remediation. Review the outstanding control items listed below."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Checklist Table */}
      <div className="cyber-glass p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyber-cyan" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">{selectedFramework} Control Directory</h3>
          </div>
          <button 
            onClick={fetchControls}
            className="p-1 text-gray-400 hover:text-white transition duration-200"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>

        {loading ? (
          <div className="h-44 flex items-center justify-center text-sm font-mono text-gray-500">
            Mapping security framework controls...
          </div>
        ) : filteredControls.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-sm font-mono text-gray-500">
            No compliance controls registered for this framework.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredControls.map((c) => (
              <div 
                key={c.id}
                className={`p-4 rounded-xl border font-mono text-xs flex flex-col md:flex-row md:items-start justify-between gap-4 transition duration-200 ${
                  c.status === "compliant" 
                    ? "bg-cyber-navy/40 border-white/5 hover:border-cyber-blue/15" 
                    : "bg-cyber-crimson/5 border-cyber-crimson/20 hover:border-cyber-crimson/40"
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-cyber-blue/15 text-cyber-cyan border border-cyber-cyan/20 rounded font-bold">
                      {c.control_id}
                    </span>
                    <h4 className="text-sm font-bold text-white">{c.title}</h4>
                  </div>
                  <p className="text-gray-400 leading-normal">{c.description}</p>
                  
                  <div className="p-3 bg-cyber-bg/40 rounded-lg border border-white/5 space-y-1 mt-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Logged Evidence:</span>
                    <p className="text-gray-300 leading-normal">{c.evidence}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 text-[10px] pt-1">
                  <span className={`px-2 py-0.5 rounded uppercase font-bold ${
                    c.status === "compliant" 
                      ? "bg-cyber-emerald/15 text-cyber-emerald" 
                      : "bg-cyber-crimson/15 text-cyber-crimson pulse-cyber"
                  }`}>
                    {c.status === "compliant" ? "Compliant" : "Control Gap"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
