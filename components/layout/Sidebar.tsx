"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tag,
  ShoppingBag,
  Boxes,
  BarChart3,
  Truck,
  Sparkles,
  Settings,
  Zap,
  ExternalLink,
  WifiOff,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";
import { useShop, ShopInfo } from "@/context/ShopContext";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard",           icon: LayoutDashboard },
  { label: "Listings",  href: "/dashboard/listings",  icon: Tag },
  { label: "AI Writer", href: "/dashboard/ai-writer", icon: Sparkles },
  { label: "Orders",    href: "/dashboard/orders",    icon: ShoppingBag },
  { label: "Inventory", href: "/dashboard/inventory", icon: Boxes },
  { label: "Shipping",  href: "/dashboard/shipping",  icon: Truck },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const bottomItems = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ─── Shop Initials Avatar ─────────────────────────────────────────────────────
function ShopAvatar({ shop, size = 28 }: { shop: ShopInfo; size?: number }) {
  const initials = shop.shopName
    ? shop.shopName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "ON";

  return shop.iconUrl ? (
    <img src={shop.iconUrl} alt="" style={{ width: size, height: size, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: 6, background: "linear-gradient(135deg, hsl(350 80% 60%), hsl(20 80% 60%))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "white", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

// ─── Shop Switcher Badge ──────────────────────────────────────────────────────
function ShopBadge() {
  const { shop, allShops, loading, switchShop } = useShop();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasMultiple = allShops.length > 1;

  return (
    <div style={{ padding: "12px 12px 4px" }} ref={ref}>
      <button
        onClick={() => hasMultiple && setOpen(o => !o)}
        style={{
          width: "100%",
          background: "hsl(var(--bg-elevated))",
          border: `1px solid hsl(var(--bg-border))`,
          borderRadius: 8,
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: hasMultiple ? "pointer" : "default",
          transition: "border-color 0.15s",
          textAlign: "left",
        }}
      >
        {/* Avatar */}
        {loading ? (
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "hsl(var(--bg-border))" }} />
        ) : (
          <ShopAvatar shop={shop} />
        )}

        {/* Name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-primary))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {loading ? "Loading..." : (shop.shopName ?? "Orra Nails")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
            {loading ? (
              <span style={{ fontSize: 10, color: "hsl(var(--text-muted))" }}>Checking...</span>
            ) : shop.connected ? (
              <><span className="live-dot" /><span style={{ fontSize: 10, color: "hsl(var(--status-success))" }}>Connected</span></>
            ) : (
              <><WifiOff size={9} color="hsl(var(--status-warning))" /><span style={{ fontSize: 10, color: "hsl(var(--status-warning))" }}>Not connected</span></>
            )}
          </div>
        </div>

        {/* Right side icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {shop.connected && shop.shopUrl && (
            <a href={shop.shopUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
              <ExternalLink size={12} color="hsl(var(--text-muted))" />
            </a>
          )}
          {hasMultiple && (
            <ChevronDown size={12} color="hsl(var(--text-muted))" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
          )}
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ marginTop: 4, background: "hsl(var(--bg-surface))", border: "1px solid hsl(var(--bg-border))", borderRadius: 8, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", zIndex: 100 }}>
          <div style={{ padding: "6px 10px 4px", fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "hsl(var(--text-muted))" }}>
            Switch Shop
          </div>
          {allShops.map((s) => (
            <button
              key={s.id}
              onClick={() => { if (s.id) { switchShop(s.id); setOpen(false); } }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                background: s.isActive ? "hsl(var(--brand-primary) / 0.1)" : "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.1s",
              }}
            >
              <ShopAvatar shop={s} size={22} />
              <span style={{ flex: 1, fontSize: 12, fontWeight: s.isActive ? 700 : 400, color: "hsl(var(--text-primary))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {s.shopName}
              </span>
              {s.isActive && <Check size={13} color="hsl(var(--brand-primary))" />}
            </button>
          ))}
          <div style={{ borderTop: "1px solid hsl(var(--bg-border))", padding: 4 }}>
            <Link href="/dashboard/settings" onClick={() => setOpen(false)}>
              <button style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "transparent", border: "none", cursor: "pointer", fontSize: 11, color: "hsl(var(--text-muted))", borderRadius: 6 }}>
                <Plus size={12} />
                Add another shop
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        minWidth: "var(--sidebar-width)",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "hsl(var(--bg-surface))",
        borderRight: "1px solid hsl(var(--bg-border))",
        padding: "0",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "var(--topbar-height)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          borderBottom: "1px solid hsl(var(--bg-border))",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Zap size={16} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div
            className="font-display"
            style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--text-primary))" }}
          >
            SellorPilot
          </div>
          <div style={{ fontSize: 10, color: "hsl(var(--text-muted))", marginTop: -1 }}>
            Etsy Automation
          </div>
        </div>
      </div>

      {/* Shop Switcher Badge */}
      <ShopBadge />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "hsl(var(--text-muted))", padding: "8px 4px 4px", marginTop: 4 }}>
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "8px 12px 16px", borderTop: "1px solid hsl(var(--bg-border))" }}>
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${isActive ? "active" : ""}`}>
              <Icon size={16} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}

        {/* Version */}
        <div style={{ marginTop: 12, padding: "0 4px", fontSize: 10, color: "hsl(var(--text-muted))" }}>
          v0.1.0 · Phase 1 Build
        </div>
      </div>
    </aside>
  );
}
