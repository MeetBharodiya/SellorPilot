"use client";

import TopBar from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import {
  Tag,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  Package,
} from "lucide-react";
import Link from "next/link";

// ─── Mock Data (replaced with real API data after backend integration) ─────
type StatColor = "violet" | "blue" | "emerald" | "amber";

const stats: {
  label: string;
  value: string;
  change: null;
  icon: React.ElementType;
  color: StatColor;
  href: string;
}[] = [
  {
    label: "Active Listings",
    value: "—",
    change: null,
    icon: Tag,
    color: "violet",
    href: "/dashboard/listings",
  },
  {
    label: "Pending Orders",
    value: "—",
    change: null,
    icon: ShoppingBag,
    color: "blue",
    href: "/dashboard/orders",
  },
  {
    label: "Revenue (Month)",
    value: "—",
    change: null,
    icon: DollarSign,
    color: "emerald",
    href: "/dashboard/analytics",
  },
  {
    label: "Low Stock Items",
    value: "—",
    change: null,
    icon: AlertTriangle,
    color: "amber",
    href: "/dashboard/inventory",
  },
];

const recentActivity = [
  { type: "info", message: "Shop connected. Waiting for first sync.", time: "Just now" },
  { type: "success", message: "Etsy API key approved.", time: "Today" },
  { type: "success", message: "Database initialized successfully.", time: "Today" },
];

const quickActions = [
  { label: "New Listing",  icon: Plus,        href: "/dashboard/listings/new", primary: true  },
  { label: "AI Writer",   icon: Tag,         href: "/dashboard/ai-writer",    primary: false },
  { label: "View Orders", icon: ShoppingBag, href: "/dashboard/orders",        primary: false },
];

// ─── Page helpers ────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: string;
  change?: null;
  icon: React.ElementType;
  color: StatColor;
  href: string;
}) {
  const colors = {
    violet: {
      bg: "hsl(var(--brand-primary) / 0.12)",
      border: "hsl(var(--brand-primary) / 0.25)",
      icon: "hsl(var(--brand-primary))",
      glow: "glow-violet",
    },
    blue: {
      bg: "hsl(var(--brand-secondary) / 0.12)",
      border: "hsl(var(--brand-secondary) / 0.25)",
      icon: "hsl(var(--brand-secondary))",
      glow: "glow-blue",
    },
    emerald: {
      bg: "hsl(var(--status-success) / 0.12)",
      border: "hsl(var(--status-success) / 0.25)",
      icon: "hsl(var(--status-success))",
      glow: "glow-emerald",
    },
    amber: {
      bg: "hsl(var(--status-warning) / 0.12)",
      border: "hsl(var(--status-warning) / 0.25)",
      icon: "hsl(var(--status-warning))",
      glow: "glow-amber",
    },
  };
  const c = colors[color];

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className={`glass ${c.glow} animate-fade-in`}
        style={{
          padding: "20px 22px",
          cursor: "pointer",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          borderColor: c.border,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--text-muted))", marginBottom: 8, letterSpacing: "0.02em" }}>
              {label}
            </div>
            <div
              className="font-display"
              style={{ fontSize: 28, fontWeight: 700, color: "hsl(var(--text-primary))", lineHeight: 1 }}
            >
              {value}
            </div>
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: c.bg,
              border: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={18} color={c.icon} strokeWidth={2} />
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 4, color: "hsl(var(--text-muted))", fontSize: 12 }}>
          <Clock size={11} />
          Connect shop to sync data
          <ArrowRight size={11} style={{ marginLeft: "auto" }} />
        </div>
      </div>
    </Link>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { info } = useToast();
  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle="Welcome back — here's your shop at a glance"
        actions={
          <Link href="/dashboard/listings/new">
            <button className="btn btn-primary btn-sm">
              <Plus size={14} />
              New Listing
            </button>
          </Link>
        }
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

        {/* Setup Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, hsl(var(--brand-primary) / 0.1), hsl(var(--brand-secondary) / 0.08))",
            border: "1px solid hsl(var(--brand-primary) / 0.25)",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "hsl(var(--brand-primary) / 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Package size={18} color="hsl(var(--brand-primary))" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--text-primary))" }}>
              🎉 SellorPilot is ready! Connect your Etsy shop to start syncing data.
            </div>
            <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 2 }}>
              Add your Etsy credentials in Settings → once connected, all stats will populate automatically.
            </div>
          </div>
          <Link href="/dashboard/settings">
            <button className="btn btn-primary btn-sm">
              Connect Shop
              <ArrowRight size={13} />
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
          }}
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Bottom Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

          {/* Quick Actions */}
          <div className="glass" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--text-primary))" }}>
                Quick Actions
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
                    <div
                      style={{ padding: "14px 16px", borderRadius: 10, background: action.primary ? "linear-gradient(135deg, hsl(var(--brand-primary) / 0.15), hsl(var(--brand-secondary) / 0.1))" : "hsl(var(--bg-elevated))", border: action.primary ? "1px solid hsl(var(--brand-primary) / 0.3)" : "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "opacity 0.15s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.8"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: action.primary ? "hsl(var(--brand-primary) / 0.2)" : "hsl(var(--bg-overlay))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={15} color={action.primary ? "hsl(var(--brand-primary))" : "hsl(var(--text-secondary))"} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: action.primary ? "hsl(var(--text-primary))" : "hsl(var(--text-secondary))" }}>{action.label}</span>
                    </div>
                  </Link>
                );
              })}
              {/* Sync Shop — button action, not a link */}
              <div
                onClick={() => info("Sync requires Etsy connection", "Go to Settings → Connect Etsy Shop to enable live sync.")}
                style={{ padding: "14px 16px", borderRadius: 10, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "opacity 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "0.8"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "hsl(var(--bg-overlay))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <RefreshCw size={15} color="hsl(var(--text-secondary))" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))" }}>Sync Shop</span>
              </div>
            </div>

            {/* Phase roadmap teaser */}
            <div style={{ marginTop: 20 }} className="divider" />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "hsl(var(--text-muted))" }}>
                Coming Next
              </div>
              {[
                { label: "Bulk Listing Editor", phase: "Phase 1" },
                { label: "Order Webhook Integration", phase: "Phase 2" },
                { label: "Revenue Analytics", phase: "Phase 3" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>{item.label}</span>
                  <span
                    className="badge"
                    style={{
                      background: "hsl(var(--brand-primary) / 0.1)",
                      color: "hsl(var(--brand-primary))",
                      borderColor: "hsl(var(--brand-primary) / 0.2)",
                    }}
                  >
                    {item.phase}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--text-primary))" }}>
                Activity
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="live-dot" />
                <span style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>Live</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "10px 0",
                    borderBottom: i < recentActivity.length - 1 ? "1px solid hsl(var(--bg-border) / 0.5)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: item.type === "success"
                        ? "hsl(var(--status-success) / 0.15)"
                        : "hsl(var(--brand-secondary) / 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {item.type === "success"
                      ? <CheckCircle size={13} color="hsl(var(--status-success))" />
                      : <Clock size={13} color="hsl(var(--brand-secondary))" />
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-secondary))", lineHeight: 1.4 }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 3 }}>
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
