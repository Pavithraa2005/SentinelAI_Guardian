"use client";

import { useEffect, useState } from "react";
import { 
  Settings, Key, Bell, Shield, 
  Save, CheckCircle, RefreshCw, AlertTriangle 
} from "lucide-react";

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  
  const [maskedGeminiKey, setMaskedGeminiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  
  const [keySuccess, setKeySuccess] = useState("");
  const [webhookSuccess, setWebhookSuccess] = useState("");
  
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings");
      if (res.ok) {
        const data = await res.json();
        setMaskedGeminiKey(data.GEMINI_API_KEY || "Not Configured");
        setSlackWebhook(data.SLACK_WEBHOOK || "");
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    setUsername(localStorage.getItem("username") || "Analyst");
    setRole(localStorage.getItem("role") || "analyst");
  }, []);

  const saveGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiKey.trim()) return;
    setSavingKey(true);
    setKeySuccess("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "GEMINI_API_KEY", value: geminiKey })
      });
      if (res.ok) {
        setKeySuccess("Gemini API key updated successfully.");
        setGeminiKey("");
        fetchSettings();
      }
    } catch (e) {
      console.error("Failed to save key", e);
    } finally {
      setSavingKey(false);
    }
  };

  const saveSlackWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWebhook(true);
    setWebhookSuccess("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "SLACK_WEBHOOK", value: slackWebhook })
      });
      if (res.ok) {
        setWebhookSuccess("Slack alerting webhook updated.");
        fetchSettings();
      }
    } catch (e) {
      console.error("Failed to save webhook", e);
    } finally {
      setSavingWebhook(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center font-mono text-gray-400">
        <RefreshCw className="w-6 h-6 text-cyber-cyan animate-spin mb-4" />
        LOADING CONSOLE PREFERENCES...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono text-xs text-gray-300">
      
      {/* User Profile Card */}
      <div className="cyber-glass p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Shield className="w-5 h-5 text-cyber-cyan" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">User Console Identity</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-gray-500 uppercase tracking-wider">Console Username</span>
            <p className="text-white text-sm font-bold mt-0.5">{username}</p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-500 uppercase tracking-wider">Access Scope Role</span>
            <p className="text-cyber-cyan text-sm font-bold mt-0.5 uppercase tracking-wide">{role}</p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-500 uppercase tracking-wider">Identity Token Status</span>
            <p className="text-cyber-emerald text-sm font-bold mt-0.5">VALID (24H EXP)</p>
          </div>
        </div>
      </div>

      {/* API Configuration Card */}
      <div className="cyber-glass p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Key className="w-5 h-5 text-cyber-cyan" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">AI Engine Configuration</h3>
        </div>
        
        <p className="text-[11px] text-gray-400 leading-normal">
          SentinelAI uses Google Gemini API to analyze active threats and formulate step-by-step restoration playbooks. Provide a valid key below to enable dynamic AI.
        </p>

        <div className="p-3 bg-cyber-blue/5 border border-cyber-blue/15 rounded-lg text-[11px] flex justify-between items-center text-gray-400">
          <span>Active Configured Key:</span>
          <strong className="text-white">{maskedGeminiKey}</strong>
        </div>

        <form onSubmit={saveGeminiKey} className="space-y-3 pt-2">
          {keySuccess && (
            <div className="p-3 bg-cyber-emerald/15 border border-cyber-emerald/30 text-cyber-emerald rounded-lg">
              {keySuccess}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-gray-500 uppercase">Input New Gemini API Key</label>
            <div className="flex gap-3">
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Enter Gemini API key (AIzaSy...)"
                required
                className="flex-1 bg-cyber-bg border border-cyber-blue/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-cyan font-mono transition"
              />
              <button
                type="submit"
                disabled={savingKey}
                className="px-6 bg-cyber-cyan text-cyber-bg font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,255,240,0.3)] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingKey ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                SAVE KEY
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SIEM/Alerting Integration Card */}
      <div className="cyber-glass p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Bell className="w-5 h-5 text-cyber-cyan" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">SIEM & Alerting Integrations</h3>
        </div>

        <form onSubmit={saveSlackWebhook} className="space-y-4">
          {webhookSuccess && (
            <div className="p-3 bg-cyber-emerald/15 border border-cyber-emerald/30 text-cyber-emerald rounded-lg">
              {webhookSuccess}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-gray-500 uppercase">Slack Webhook URL</label>
            <div className="flex gap-3">
              <input
                type="url"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="flex-1 bg-cyber-bg border border-cyber-blue/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyber-cyan font-mono transition"
              />
              <button
                type="submit"
                disabled={savingWebhook}
                className="px-6 bg-cyber-cyan text-cyber-bg font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,255,240,0.3)] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {savingWebhook ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                SAVE WEBHOOK
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-cyber-navy/40 border border-white/5 rounded-lg">
              <span className="text-gray-500 uppercase block mb-1">Microsoft Teams</span>
              <p className="text-[10px] text-gray-500">Not Configured. Enable in webhooks panel.</p>
            </div>
            <div className="p-3 bg-cyber-navy/40 border border-white/5 rounded-lg">
              <span className="text-gray-500 uppercase block mb-1">Webhook Splunk Integration</span>
              <p className="text-[10px] text-gray-500">Not Configured. Enforce JSON payloads.</p>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
}
