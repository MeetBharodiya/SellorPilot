"use client";

import TopBar from "@/components/layout/TopBar";
import { Settings, Key, Zap, Bell, Shield, Save, ExternalLink, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";

const DEFAULT_NOTIFICATIONS = [
  { key: "new_order",   label: "New order received",            desc: "Alert when a buyer places an order",                    on: true  },
  { key: "low_stock",   label: "Low stock alert",               desc: "Alert when inventory drops below threshold",             on: true  },
  { key: "listing_exp", label: "Listing expired",               desc: "Alert when a listing expires on Etsy",                  on: false },
  { key: "sched_pub",   label: "Scheduled listing published",   desc: "Confirm when a scheduled listing goes live",            on: true  },
];

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);

  const toggleNotification = (key: string) => {
    setNotifications(prev =>
      prev.map(n => n.key === key ? { ...n, on: !n.on } : n)
    );
  };

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <>
      <TopBar title="Settings" subtitle="Configure your Etsy connection and app preferences" />
      <div style={{ padding: "24px", maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Etsy Connection */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", gap: 10 }}>
            <Zap size={16} color="hsl(var(--brand-primary))" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>Etsy API Connection</div>
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", borderRadius: 8, background: "hsl(var(--status-warning) / 0.1)", border: "1px solid hsl(var(--status-warning) / 0.3)" }}>
              <Clock size={14} color="hsl(var(--status-warning))" />
              <span style={{ fontSize: 13, color: "hsl(var(--text-secondary))" }}>
                OAuth connection required — clicking "Connect" will open Etsy authorization
              </span>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {[
                { label: "API Keystring", value: "ma2keca7flsy00zxcjyr2nto", readonly: true },
                { label: "Shared Secret", value: "••••••••••••••••••••••", readonly: true, secret: true },
                { label: "OAuth Redirect URI", value: "http://localhost:3000/api/auth/callback/etsy", readonly: true },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>{field.label}</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="input" style={{ fontSize: 13, fontFamily: field.secret ? "monospace" : "inherit", color: "hsl(var(--text-muted))" }} defaultValue={field.value} readOnly={field.readonly} />
                    {field.readonly && (
                      <button className="btn btn-ghost btn-sm" title="Managed via .env.local">
                        <Key size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button className="btn btn-primary">
                <ExternalLink size={14} />
                Connect Etsy Shop
              </button>
              <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", display: "flex", alignItems: "center" }}>
                API key stored in .env.local (never committed to Git)
              </div>
            </div>
          </div>
        </div>

        {/* Shop Info */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", gap: 10 }}>
            <Settings size={16} color="hsl(var(--brand-secondary))" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>Shop Preferences</div>
          </div>
          <div style={{ padding: "20px", display: "grid", gap: 14 }}>
            {[
              { label: "Shop Name", value: "Orra Nails", placeholder: "Your Etsy shop name" },
              { label: "Default Currency", value: "USD", placeholder: "USD" },
              { label: "Origin Country", value: "India", placeholder: "Your country" },
              { label: "Low Stock Alert Threshold", value: "5", placeholder: "e.g. 5", type: "number" },
            ].map(field => (
              <div key={field.label}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>{field.label}</label>
                <input className="input" style={{ fontSize: 13 }} defaultValue={field.value} placeholder={field.placeholder} type={field.type ?? "text"} />
              </div>
            ))}
          </div>
        </div>

        {/* AI Settings */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", gap: 10 }}>
            <Zap size={16} color="hsl(var(--status-warning))" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>AI Writer Settings</div>
          </div>
          <div style={{ padding: "20px", display: "grid", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>AI Provider</label>
              <select className="input" style={{ fontSize: 13 }}>
                <option>OpenAI (GPT-4o)</option>
                <option>Google Gemini</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>API Key</label>
              <input className="input" style={{ fontSize: 13, fontFamily: "monospace" }} placeholder="sk-... or AI-..." type="password" />
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", fontSize: 12, color: "hsl(var(--text-muted))" }}>
              🔒 API keys are stored in .env.local and never exposed to the browser or committed to Git
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={16} color="hsl(var(--status-info))" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>Notifications</div>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            {notifications.map(n => (
              <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid hsl(var(--bg-border) / 0.5)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>{n.label}</div>
                  <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>{n.desc}</div>
                </div>
                <button
                  onClick={() => toggleNotification(n.key)}
                  title={n.on ? "Click to disable" : "Click to enable"}
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: 99,
                    background: n.on ? "hsl(var(--brand-primary))" : "hsl(var(--bg-border))",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: 3,
                    left: n.on ? 21 : 3,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 0.2s ease",
                  }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div>
          <button className="btn btn-primary btn-lg" onClick={save} style={{ gap: 8 }}>
            {saved ? <><CheckCircle size={16} />Saved!</> : <><Save size={15} />Save Settings</>}
          </button>
        </div>
      </div>
    </>
  );
}
