"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Shield, LayoutDashboard, AlertOctagon, ShieldAlert, 
  FileCheck2, Bot, Settings, LogOut, Cpu, Activity, Zap, Play
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "info" | "warn" }>({
    show: false,
    msg: "",
    type: "info"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("username") || "Analyst";
    const storedRole = localStorage.getItem("role") || "analyst";
    
    if (!token) {
      router.push("/");
    } else {
      setUsername(storedUser);
      setRole(storedRole);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    router.push("/");
  };

  const triggerSimulation = async () => {
    setSimulating(true);
    showToast("Deploying dynamic threat payload...", "info");
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/alerts/simulate", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`Threat Simulated: ${data.alert.title}`, "warn");
        
        // Custom event to notify active views to refresh their list
        window.dispatchEvent(new Event("refresh-alerts"));
      } else {
        showToast("Simulation failed. Backend server offline.", "info");
      }
    } catch (e) {
      showToast("Cannot connect to simulation engine.", "info");
    } finally {
      setSimulating(false);
    }
  };

  const showToast = (msg: string, type: "info" | "warn") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "info" }), 4000);
  };

  const navItems = [
    { name: "SOC Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Threat Analysis", path: "/dashboard/threats", icon: AlertOctagon },
    { name: "Vulnerability Center", path: "/dashboard/vulnerabilities", icon: ShieldAlert },
    { name: "Compliance Center", path: "/dashboard/compliance", icon: FileCheck2 },
    { name: "AI Analyst", path: "/dashboard/assistant", icon: Bot },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-cyber-bg overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-cyber-blue/15 bg-cyber-navy/50 backdrop-blur-md flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-cyber-blue/10 flex items-center gap-3">
            <Shield className="w-7 h-7 text-cyber-cyan pulse-cyber" />
            <div>
              <h1 className="text-lg font-bold text-white tracking-wider">SENTINEL<span className="text-cyber-cyan">AI</span></h1>
              <p className="text-[9px] text-cyber-blue tracking-widest font-mono uppercase">Guardian Console</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-mono transition duration-200 ${
                    isActive 
                      ? "bg-cyber-blue/15 text-cyber-cyan border border-cyber-cyan/35" 
                      : "text-gray-400 hover:bg-cyber-navy/40 hover:text-white border border-transparent"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-cyber-cyan" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-cyber-blue/10 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-cyber-blue/20 border border-cyber-cyan/30 flex items-center justify-center font-bold text-cyber-cyan uppercase">
              {username ? username[0] : "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{username || "Analyst"}</p>
              <p className="text-[10px] text-cyber-cyan font-mono uppercase tracking-wider">{role || "analyst"}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-mono text-gray-500 hover:text-cyber-crimson hover:bg-cyber-crimson/5 transition duration-200"
          >
            <LogOut className="w-4 h-4" />
            DISCONNECT CONSOLE
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 border-b border-cyber-blue/15 bg-cyber-navy/30 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-2">
            {/* Mobile menu logo placeholder */}
            <div className="md:hidden p-1.5 bg-cyber-blue/10 rounded-md mr-2">
              <Shield className="w-5 h-5 text-cyber-cyan" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-white tracking-wide font-mono uppercase">
              {navItems.find(item => item.path === pathname)?.name || "Sentinel Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Simulate Attack Trigger Button */}
            <button 
              onClick={triggerSimulation}
              disabled={simulating}
              className="px-4 py-1.5 bg-cyber-crimson/15 border border-cyber-crimson/40 hover:bg-cyber-crimson/30 text-cyber-crimson text-xs font-mono rounded-lg hover:shadow-[0_0_10px_rgba(255,46,99,0.2)] transition duration-200 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {simulating ? "INJECTING..." : "SIMULATE THREAT"}
            </button>

            {/* Shield State Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 border border-cyber-emerald/20 bg-cyber-emerald/5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-cyber-emerald pulse-cyber"></span>
              <span className="text-[10px] font-mono text-cyber-emerald uppercase tracking-wider">Guard Online</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Pages content */}
        <main className="flex-1 overflow-y-auto bg-cyber-bg p-6 relative">
          {/* Cyber grid overlay inside main container */}
          <div className="absolute inset-0 cyber-grid opacity-[0.4] pointer-events-none z-0"></div>
          <div className="relative z-10 min-h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Notifications Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border max-w-sm flex items-start gap-3 shadow-2xl transition duration-300 transform translate-y-0 ${
          toast.type === "warn" 
            ? "bg-cyber-crimson/95 border-cyber-crimson text-white" 
            : "bg-cyber-navy/95 border-cyber-cyan text-gray-200"
        }`}>
          {toast.type === "warn" ? (
            <ShieldAlert className="w-6 h-6 text-white shrink-0 pulse-cyber" />
          ) : (
            <Activity className="w-6 h-6 text-cyber-cyan shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-xs font-mono uppercase tracking-wider">
              {toast.type === "warn" ? "Agent Intrusion Alert" : "System Update"}
            </h4>
            <p className="text-xs mt-1 text-gray-200 leading-normal">{toast.msg}</p>
          </div>
        </div>
      )}

    </div>
  );
}
