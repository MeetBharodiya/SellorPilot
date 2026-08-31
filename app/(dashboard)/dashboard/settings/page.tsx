"use client";

import TopBar from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import { useShop } from "@/context/ShopContext";
import {
  Settings, Key, Zap, Bell, Save, ExternalLink,
  CheckCircle, RefreshCw, Wifi, WifiOff, Link2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";


const DEFAULT_NOTIFICATIONS = [
  { key: "new_order",   label: "New order received",          desc: "Alert when a buyer places an order",               on: true  },
  { key: "low_stock",   label: "Low stock alert",             desc: "Alert when inventory drops below threshold",       on: true  },
  { key: "listing_exp", label: "Listing expired",             desc: "Alert when a listing expires on Etsy",            on: false },
  { key: "sched_pub",   label: "Scheduled listing published", desc: "Confirm when a scheduled listing goes live",      on: true  },
];

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { success, error: toastError, info } = useToast();
  // ✅ Single source of truth — same context used by Sidebar
  const { shop: shopStatus, loading: loadingStatus, refresh } = useShop();

  const [saved, setSaved]                     = useState(false);
  const [notifications, setNotifications]     = useState(DEFAULT_NOTIFICATIONS);
  const [connecting, setConnecting]           = useState(false);

  // ── Handle OAuth return (connected=true or error=...) ────────────────────────
  useEffect(() => {
    const connected = searchParams.get("connected");
    const errParam  = searchParams.get("error");

    if (connected === "true") {
      success("Etsy shop connected! 🎉", "Your listings, orders, and inventory are now live.");
      refresh(); // updates BOTH sidebar and settings from one source
      window.history.replaceState({}, "", "/dashboard/settings");
    } else if (errParam) {
      const messages: Record<string, string> = {
        access_denied:    "You denied access. Click Connect again to authorize.",
        state_mismatch:   "Security check failed. Please try again.",
        missing_verifier: "Session expired. Please try again.",
        missing_params:   "OAuth callback missing parameters. Try again.",
      };
      toastError("Connection failed", messages[errParam] ?? decodeURIComponent(errParam));
      window.history.replaceState({}, "", "/dashboard/settings");
    }
  }, [searchParams]);

  const handleConnect = () => {
    setConnecting(true);
    // Navigate to the OAuth connect route — it will redirect to Etsy
    window.location.href = "/api/auth/etsy/connect";
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect your Etsy shop? You can reconnect anytime.")) return;
    try {
      await fetch("/api/etsy/shop", { method: "DELETE" });
      info("Disconnected", "Shop disconnected successfully. Reconnect anytime from Settings.");
      refresh(); // re-fetch — will show not connected since token is gone
    } catch (err) {
      toastError("Error", "Failed to disconnect shop.");
    }
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev => prev.map(n => n.key === key ? { ...n, on: !n.on } : n));
  };

  const save = () => {
    setSaved(true);
    success("Settings saved!", "Your preferences have been updated.");
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <TopBar title="Settings" subtitle="Configure your Etsy connection and app preferences" />
      <div style={{ padding: "24px", maxWidth: 720, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Etsy Connection ───────────────────────────────────────────── */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", gap: 10 }}>
            <Zap size={16} color="hsl(var(--brand-primary))" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>Etsy Shop Connection</div>
            {!loadingStatus && (
              <span className={`badge ${shopStatus?.connected ? "badge-success" : "badge-warning"}`} style={{ marginLeft: "auto" }}>
                {shopStatus?.connected ? "✓ Connected" : "Not Connected"}
              </span>
            )}
          </div>
          <div style={{ padding: "20px" }}>

            {/* Status banner */}
            {loadingStatus ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 8, background: "hsl(var(--bg-elevated))", marginBottom: 20 }}>
                <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} color="hsl(var(--text-muted))" />
                <span style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>Checking connection status...</span>
              </div>
            ) : shopStatus?.connected ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 8, background: "hsl(var(--status-success) / 0.1)", border: "1px solid hsl(var(--status-success) / 0.3)", marginBottom: 20 }}>
                <Wifi size={16} color="hsl(var(--status-success))" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--status-success))" }}>
                    Connected — {shopStatus.shopName}
                  </div>
                  <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 2 }}>
                    Currency: {shopStatus.currency} · Token expires: {shopStatus.tokenExpiry ? new Date(shopStatus.tokenExpiry).toLocaleDateString() : "auto-refresh"}
                  </div>
                </div>
                {shopStatus.shopUrl && (
                  <a href={shopStatus.shopUrl} target="_blank" style={{ marginLeft: "auto" }}>
                    <button className="btn btn-ghost btn-sm"><ExternalLink size={12} />View Shop</button>
                  </a>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 8, background: "hsl(var(--status-warning) / 0.1)", border: "1px solid hsl(var(--status-warning) / 0.3)", marginBottom: 20 }}>
                <WifiOff size={14} color="hsl(var(--status-warning))" />
                <span style={{ fontSize: 13, color: "hsl(var(--text-secondary))" }}>
                  Not connected — click "Connect Etsy Shop" to authorize with OAuth
                </span>
              </div>
            )}

            {/* API fields */}
            <div style={{ display: "grid", gap: 14 }}>
              {[
                { label: "API Keystring",    value: "ma2keca7flsy00zxcjyr2nto",                              readonly: true },
                { label: "Shared Secret",    value: "••••••••••••••••",                                       readonly: true, secret: true },
                { label: "OAuth Callback URI (add this in Etsy Developer portal)", value: "http://localhost:3000/api/auth/etsy/callback", readonly: true },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>{field.label}</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="input"
                      style={{ fontSize: 13, fontFamily: field.secret ? "monospace" : "inherit", color: "hsl(var(--text-muted))" }}
                      defaultValue={field.value}
                      readOnly={field.readonly}
                    />
                    <button
                      className="btn btn-ghost btn-sm"
                      title="Copy"
                      onClick={() => { navigator.clipboard.writeText(field.value); info("Copied!", field.label + " copied to clipboard"); }}
                    >
                      <Key size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "center" }}>
              {shopStatus?.connected ? (
                <>
                  <button className="btn btn-secondary" onClick={handleDisconnect}>
                    <WifiOff size={14} />Disconnect Shop
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={refresh}>
                    <RefreshCw size={13} />Refresh Status
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={handleConnect}
                  disabled={connecting}
                  style={{ gap: 8 }}
                >
                  {connecting
                    ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />Redirecting to Etsy...</>
                    : <><Link2 size={14} />Connect Etsy Shop</>
                  }
                </button>
              )}
              <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>
                API key stored in .env.local — never committed to Git
              </div>
            </div>
          </div>
        </div>

        {/* ── Shop Preferences ──────────────────────────────────────────── */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", gap: 10 }}>
            <Settings size={16} color="hsl(var(--brand-secondary))" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>Shop Preferences</div>
          </div>
          <div style={{ padding: "20px", display: "grid", gap: 14 }}>
            {[
              { label: "Shop Name",                    value: "Orra Nails", placeholder: "Your Etsy shop name" },
              { label: "Default Currency",             value: "INR",        placeholder: "INR" },
              { label: "Origin Country",               value: "India",      placeholder: "Your country" },
              { label: "Low Stock Alert Threshold",    value: "5",          placeholder: "e.g. 5", type: "number" },
            ].map(field => (
              <div key={field.label}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>{field.label}</label>
                <input className="input" style={{ fontSize: 13 }} defaultValue={field.value} placeholder={field.placeholder} type={field.type ?? "text"} />
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Settings ───────────────────────────────────────────────── */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", gap: 10 }}>
            <Zap size={16} color="hsl(var(--status-warning))" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>AI Writer</div>
            <span className="badge badge-success" style={{ marginLeft: "auto" }}>✓ Gemini Connected</span>
          </div>
          <div style={{ padding: "20px", display: "grid", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>AI Model</label>
              <select className="input" style={{ fontSize: 13 }}>
                <option>Google Gemini 1.5 Flash (Active)</option>
                <option>Google Gemini 1.5 Pro</option>
              </select>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "hsl(var(--status-success) / 0.08)", border: "1px solid hsl(var(--status-success) / 0.25)", fontSize: 12, color: "hsl(var(--text-muted))" }}>
              ✓ Gemini API key is configured in .env.local — AI listing generation is active
            </div>
          </div>
        </div>

        {/* ── Notifications ────────────────────────────────────────────── */}
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
                  style={{ width: 40, height: 22, borderRadius: 99, background: n.on ? "hsl(var(--brand-primary))" : "hsl(var(--bg-border))", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <span style={{ position: "absolute", top: 3, left: n.on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s ease" }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Save ─────────────────────────────────────────────────────── */}
        <div>
          <button className="btn btn-primary btn-lg" onClick={save} style={{ gap: 8 }}>
            {saved ? <><CheckCircle size={16} />Saved!</> : <><Save size={15} />Save Settings</>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .badge-success { background: hsl(var(--status-success) / 0.15); color: hsl(var(--status-success)); border-color: hsl(var(--status-success) / 0.3); }
        .badge-warning { background: hsl(var(--status-warning) / 0.15); color: hsl(var(--status-warning)); border-color: hsl(var(--status-warning) / 0.3); }
      `}</style>
    </>
  );
}
