"use client";

import { useEffect, useState } from "react";
import { 
  ShieldAlert, ShieldCheck, Flame, Cpu, 
  Settings, RefreshCw, AlertTriangle, Play, CheckCircle2 
} from "lucide-react";

interface Vulnerability {
  id: number;
  cve_id: string;
  title: string;
  description: string;
  cvss_score: number;
  severity: string;
  status: string;
  asset: string;
  patch_status: string;
  remediation: string;
  created_at: string;
}

export default function VulnerabilityCenter() {
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [patchLoading, setPatchLoading] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchVulns = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/vulnerabilities");
      if (res.ok) {
        const data = await res.json();
        setVulns(data);
      }
    } catch (e) {
      console.error("Failed to load vulnerabilities", e);
      // Fallback mock
      setVulns([
        {
          id: 1,
          cve_id: "CVE-2024-3094",
          title: "XZ Utils Backdoor",
          description: "Malicious code discovered in the upstream tarballs of xz, leading to SSH backdoor.",
          cvss_score: 10.0,
          severity: "Critical",
          status: "open",
          asset: "prod-backend-vm",
          patch_status: "scheduled",
          remediation: "Upgrade xz-utils to version 5.6.1 or downgrade to 5.4.6.",
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          cve_id: "CVE-2023-38606",
          title: "Apple iOS Kernel Vulnerability",
          description: "Issue in kernel state handling could allow a local attacker to execute arbitrary code.",
          cvss_score: 8.8,
          severity: "High",
          status: "open",
          asset: "mdm-iphone-12",
          patch_status: "pending",
          remediation: "Apply iOS 16.6 update immediately.",
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulns();
  }, []);

  const handleApplyPatch = async (id: number) => {
    setPatchLoading(id);
    setSuccessMsg("");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/vulnerabilities/${id}/patch`, {
        method: "POST"
      });
      if (res.ok) {
        setSuccessMsg("Patch successfully deployed to host VM. Verification scanner completed.");
        fetchVulns();
      }
    } catch (e) {
      console.error("Failed to deploy patch", e);
    } finally {
      setPatchLoading(null);
    }
  };

  // Helper counts
  const totalAssets = 42;
  const openVulnsCount = vulns.filter(v => v.status === "open").length;
  const patchedCount = vulns.filter(v => v.status === "resolved").length;

  return (
    <div className="space-y-6">
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="cyber-glass p-5 rounded-2xl relative overflow-hidden">
          <h4 className="text-xs font-mono text-gray-400 uppercase">Monitored Cloud Assets</h4>
          <p className="text-3xl font-extrabold text-white mt-2 font-mono">{totalAssets}</p>
          <div className="text-[10px] text-cyber-cyan font-mono mt-1">GCP/AWS/On-Prem Instances</div>
        </div>

        <div className="cyber-glass p-5 rounded-2xl relative overflow-hidden">
          <h4 className="text-xs font-mono text-gray-400 uppercase">Open CVE Backlog</h4>
          <p className="text-3xl font-extrabold text-cyber-crimson mt-2 font-mono">{openVulnsCount}</p>
          <div className="text-[10px] text-cyber-crimson font-mono mt-1">Requires Patch Attention</div>
        </div>

        <div className="cyber-glass p-5 rounded-2xl relative overflow-hidden">
          <h4 className="text-xs font-mono text-gray-400 uppercase">Patched & Verified</h4>
          <p className="text-3xl font-extrabold text-cyber-emerald mt-2 font-mono">{patchedCount}</p>
          <div className="text-[10px] text-cyber-emerald font-mono mt-1">Last 30 Days</div>
        </div>

        <div className="cyber-glass p-5 rounded-2xl relative overflow-hidden">
          <h4 className="text-xs font-mono text-gray-400 uppercase">Shift-Left CI/CD SCAN</h4>
          <p className="text-lg font-bold text-cyber-cyan mt-3 font-mono flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5 text-cyber-emerald" /> COMPLIANT
          </p>
          <div className="text-[10px] text-gray-500 font-mono mt-1">GitHub Actions Scan Active</div>
        </div>
      </div>

      {/* Heatmap & CI/CD Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Heatmap */}
        <div className="cyber-glass p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Risk Distribution Heatmap</h3>
            <p className="text-[10px] text-cyber-cyan font-mono mt-0.5">Asset Criticality vs CVE Severity density</p>
          </div>

          {/* Simple Grid Heatmap */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
            {/* Header row */}
            <div></div>
            <div className="p-2 text-[10px] text-gray-400 uppercase">Low Asset</div>
            <div className="p-2 text-[10px] text-gray-400 uppercase">Med Asset</div>
            <div className="p-2 text-[10px] text-gray-400 uppercase">High Asset</div>
            
            {/* Critical Row */}
            <div className="p-2 text-[10px] text-cyber-crimson uppercase font-bold flex items-center justify-center">Critical CVSS</div>
            <div className="bg-cyber-crimson/10 border border-cyber-crimson/20 p-4 rounded-lg flex items-center justify-center text-white">0</div>
            <div className="bg-cyber-crimson/30 border border-cyber-crimson/50 p-4 rounded-lg flex items-center justify-center text-white font-bold">1</div>
            <div className="bg-cyber-crimson/60 border border-cyber-crimson p-4 rounded-lg flex items-center justify-center text-white font-extrabold text-sm pulse-cyber">1</div>

            {/* High Row */}
            <div className="p-2 text-[10px] text-cyber-amber uppercase font-bold flex items-center justify-center">High CVSS</div>
            <div className="bg-cyber-amber/10 border border-cyber-amber/20 p-4 rounded-lg flex items-center justify-center text-white">0</div>
            <div className="bg-cyber-amber/40 border border-cyber-amber/60 p-4 rounded-lg flex items-center justify-center text-white font-bold">2</div>
            <div className="bg-cyber-amber/20 border border-cyber-amber/30 p-4 rounded-lg flex items-center justify-center text-white">0</div>

            {/* Med/Low Row */}
            <div className="p-2 text-[10px] text-cyber-blue uppercase font-bold flex items-center justify-center">Medium/Low</div>
            <div className="bg-cyber-blue/10 border border-cyber-blue/20 p-4 rounded-lg flex items-center justify-center text-white">4</div>
            <div className="bg-cyber-blue/10 border border-cyber-blue/20 p-4 rounded-lg flex items-center justify-center text-white">1</div>
            <div className="bg-cyber-blue/10 border border-cyber-blue/20 p-4 rounded-lg flex items-center justify-center text-white">0</div>
          </div>
        </div>

        {/* Shadow API discovery or Deception details */}
        <div className="cyber-glass p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-1.5">
            <Flame className="w-5 h-5 text-cyber-cyan" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Honeypot Decoy Assets</h3>
          </div>
          <p className="text-xs text-gray-400 leading-normal font-mono">
            Active threat traps deployed to capture adversary lateral movement strategies.
          </p>

          <div className="space-y-3 font-mono text-[11px]">
            <div className="p-3 bg-cyber-navy/50 rounded-lg border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">Honey-DB-Decoy (5432)</p>
                <p className="text-gray-500 mt-0.5">PostgreSQL Trapped Database</p>
              </div>
              <span className="px-2 py-0.5 bg-cyber-emerald/15 text-cyber-emerald border border-cyber-emerald/30 rounded uppercase text-[9px]">ACTIVE</span>
            </div>

            <div className="p-3 bg-cyber-navy/50 rounded-lg border border-white/5 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">honeytoken-aws-deployer</p>
                <p className="text-cyber-crimson mt-0.5">Decoy Access Key Triggered</p>
              </div>
              <span className="px-2 py-0.5 bg-cyber-crimson/15 text-cyber-crimson border border-cyber-crimson/30 rounded uppercase text-[9px] pulse-cyber">ALERT</span>
            </div>
          </div>
        </div>

      </div>

      {/* CVE Table / Feed */}
      <div className="cyber-glass p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyber-cyan" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Vulnerability Scanning Feed (CVEs)</h3>
          </div>
          <button 
            onClick={fetchVulns}
            className="p-1 text-gray-400 hover:text-white transition duration-200"
          >
            <RefreshCw className="w-4.5 h-4.5" />
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-cyber-emerald/15 border border-cyber-emerald/30 text-cyber-emerald text-xs rounded-lg font-mono">
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="h-44 flex items-center justify-center text-sm font-mono text-gray-500">
            Scanning local dependencies...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-gray-400">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-cyber-cyan uppercase tracking-wider">
                  <th className="pb-3 pr-4 font-bold">CVE ID</th>
                  <th className="pb-3 px-4 font-bold">Affected Asset</th>
                  <th className="pb-3 px-4 font-bold">Vulnerability details</th>
                  <th className="pb-3 px-4 font-bold text-center">CVSS</th>
                  <th className="pb-3 px-4 font-bold text-center">Status</th>
                  <th className="pb-3 pl-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {vulns.map((vuln) => (
                  <tr key={vuln.id} className="hover:bg-cyber-navy/30 transition duration-150">
                    <td className="py-4 pr-4 font-bold text-white whitespace-nowrap">{vuln.cve_id}</td>
                    <td className="py-4 px-4 text-cyber-cyan">{vuln.asset}</td>
                    <td className="py-4 px-4 max-w-sm">
                      <p className="text-white font-medium truncate">{vuln.title}</p>
                      <p className="text-gray-500 text-[11px] truncate mt-0.5">{vuln.description}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        vuln.cvss_score >= 9.0 
                          ? "bg-cyber-crimson/15 text-cyber-crimson" 
                          : vuln.cvss_score >= 7.0 
                            ? "bg-cyber-amber/15 text-cyber-amber" 
                            : "bg-cyber-blue/15 text-cyber-cyan"
                      }`}>{vuln.cvss_score.toFixed(1)}</span>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap uppercase text-[10px]">
                      <span className={vuln.status === "resolved" ? "text-cyber-emerald" : "text-cyber-amber"}>
                        {vuln.status === "resolved" ? "Patched" : vuln.patch_status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right whitespace-nowrap">
                      {vuln.status === "resolved" ? (
                        <span className="text-cyber-emerald flex items-center justify-end gap-1.5 text-[10px] font-bold uppercase">
                          <CheckCircle2 className="w-4 h-4 text-cyber-emerald" /> Verified
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApplyPatch(vuln.id)}
                          disabled={patchLoading !== null}
                          className="px-3 py-1.5 bg-cyber-cyan/15 border border-cyber-cyan text-cyber-cyan text-[10px] font-bold rounded hover:bg-cyber-cyan text-cyber-bg transition duration-200 cursor-pointer disabled:opacity-50"
                        >
                          {patchLoading === vuln.id ? "PATCHING..." : "DEPLOY PATCH"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
