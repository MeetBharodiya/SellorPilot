"use client";

import { Bell, Search, Plus, RefreshCw } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header
      style={{
        height: "var(--topbar-height)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: 16,
        background: "hsl(var(--bg-base))",
        borderBottom: "1px solid hsl(var(--bg-border))",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Title */}
      <div style={{ flex: 1 }}>
        <h1
          className="font-display"
          style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--text-primary))", lineHeight: 1 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Search */}
      <div style={{ position: "relative", width: 240 }}>
        <Search
          size={14}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "hsl(var(--text-muted))",
          }}
        />
        <input
          className="input"
          style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
          placeholder="Search listings, orders..."
        />
      </div>

      {/* Actions */}
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}

      {/* Notifications */}
      <button
        className="btn btn-secondary btn-sm"
        style={{ width: 36, height: 36, padding: 0, position: "relative" }}
        title="Notifications"
      >
        <Bell size={15} />
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "hsl(var(--brand-primary))",
            border: "2px solid hsl(var(--bg-surface))",
          }}
        />
      </button>
    </header>
  );
}
