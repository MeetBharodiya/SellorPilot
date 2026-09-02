"use client";

import TopBar from "@/components/layout/TopBar";
import { useShop } from "@/context/ShopContext";
import {
  Tag, ShoppingBag, DollarSign, AlertTriangle,
  ArrowRight, Plus, RefreshCw, Clock,
  CheckCircle, Sparkles, ExternalLink, Wifi,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface DashStats {
  activeListings:  number;
  draftListings:   number;
  pendingOrders:   number;
  totalRevenue:    number;
  lowStockItems:   number;
  currency:        string;
}

type StatColor = "violet" | "blue" | "emerald" | "amber";

// â”€â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatCard({ label, value, sub, icon: Icon, color, href, loading }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: StatColor; href: string; loading?: boolean;
}) {
  const colors = {
    violet:  { bg: "hsl(var(--brand-primary) / 0.12)",  border: "hsl(var(--brand-primary) / 0.25)",  icon: "hsl(var(--brand-primary))"  },
    blue:    { bg: "hsl(var(--brand-secondary) / 0.12)", border: "hsl(var(--brand-secondary) / 0.25)", icon: "hsl(var(--brand-secondary))" },
    emerald: { bg: "hsl(var(--status-success) / 0.12)", border: "hsl(var(--status-success) / 0.25)", icon: "hsl(var(--status-success))"  },
    amber:   { bg: "hsl(var(--status-warning) / 0.12)", border: "hsl(var(--status-warning) / 0.25)", icon: "hsl(var(--status-warning))"  },
  };
  const c = colors[color];

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className="glass animate-fade-in" style={{ padding: "20px 22px", cursor: "pointer", transition: "transform 0.15s ease", borderColor: c.border }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "hsl(var(--text-muted))", marginBottom: 8 }}>{label}</div>
            <div className="font-display" style={{ fontSize: 28, fontWeight: 700, color: "hsl(var(--text-primary))", lineHeight: 1 }}>
              {loading ? <RefreshCw size={20} style={{ animation: "spin 1s linear infinite", color: "hsl(var(--text-muted))" }} /> : value}
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={18} color={c.icon} strokeWidth={2} />
          </div>
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 4, color: "hsl(var(--text-muted))", fontSize: 12 }}>
          {loading ? <><Clock size={11} />Loading from Etsy...</> : <><CheckCircle size={11} color="hsl(var(--status-success))" />{sub ?? "—"}</>}
          <ArrowRight size={11} style={{ marginLeft: "auto" }} />
        </div>
      </div>
    </Link>
  );
}

// â”€â”€â”€ No Shop Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NoShopBanner() {
  return (
    <div className="glass" style={{ padding: "32px 24px", textAlign: "center", borderColor: "hsl(var(--status-warning) / 0.3)" }}>
      <Wifi size={40} strokeWidth={1} color="hsl(var(--status-warning))" style={{ margin: "0 auto 12px", display: "block" }} />
      <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 6 }}>Connect your Etsy shop to see live data</div>
      <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 20 }}>Dashboard stats, listings, and orders will appear here once connected</div>
      <Link href="/dashboard/settings">
        <button className="btn btn-primary"><Wifi size={14} />Go to Settings → Connect Shop</button>
      </Link>
    </div>
  );
}

// â”€â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function DashboardPage() {
  const { shop } = useShop();
  const [stats, setStats]     = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shop.connected) { setLoading(false); return; }
    fetchStats();
  }, [shop.connected, shop.id, shop.shopName]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch listings and orders in parallel
      const [listingsRes, ordersRes] = await Promise.all([
        fetch("/api/etsy/listings"),
        fetch("/api/etsy/orders"),
      ]);

      const listingsData = listingsRes.ok  ? await listingsRes.json()  : { results: [], count: 0 };
      const ordersData   = ordersRes.ok    ? await ordersRes.json()    : { results: [], count: 0 };

      const listings = listingsData.results ?? [];
      const orders   = ordersData.results   ?? [];

      // Compute stats from real data
      const activeListings = listings.filter((l: any) => l.state === "active").length;
      const draftListings  = listings.filter((l: any) => l.state === "draft").length;
      const lowStockItems  = listings.filter((l: any) => l.quantity > 0 && l.quantity <= 3).length;

      // Pending = paid but not yet shipped
      const pendingOrders = orders.filter((o: any) =>
        o.status === "paid" || o.status === "open"
      ).length;

      // Revenue = sum of paid orders this month
      const thisMonth = new Date();
      thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);
      const totalRevenue = orders
        .filter((o: any) => new Date(o.create_timestamp * 1000) >= thisMonth)
        .reduce((sum: number, o: any) => sum + (o.grandtotal?.amount / o.grandtotal?.divisor || 0), 0);

      setStats({
        activeListings,
        draftListings,
        pendingOrders,
        totalRevenue,
        lowStockItems,
        currency: shop.currency ?? "—",
      });
    } catch (err) {
      console.error("[Dashboard] fetchStats error:", err);
    } finally {
      setLoading(false);
    }
  };
  const currencySymbol = stats?.currency === "INR" ? "₹" : "$";

  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle={shop.connected ? `${shop.shopName ?? "—"} — live overview` : "Welcome — connect your shop to begin"}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            {shop.connected && (
              <button className="btn btn-secondary btn-sm" onClick={fetchStats} disabled={loading}>
                <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
                Refresh
              </button>
            )}
            <Link href="/dashboard/listings/new">
              <button className="btn btn-primary btn-sm"><Plus size={14} />New Listing</button>
            </Link>
          </div>
        }
      />

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

        {/* Not connected */}
        {!shop.connected && !loading && <NoShopBanner />}

        {/* Stats Grid */}
        {(shop.connected || loading) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <StatCard label="Active Listings"  value={stats?.activeListings  ?? "—"} sub={`${stats?.draftListings ?? 0} drafts`} icon={Tag}          color="violet"  href="/dashboard/listings"  loading={loading} />
            <StatCard label="Pending Orders"   value={stats?.pendingOrders   ?? "—"} sub="Awaiting shipment"                     icon={ShoppingBag}  color="blue"    href="/dashboard/orders"    loading={loading} />
            <StatCard label="Revenue (Month)"  value={stats ? `${currencySymbol}${stats.totalRevenue.toLocaleString()}` : "â€”"} sub="Current month" icon={DollarSign}  color="emerald" href="/dashboard/analytics"  loading={loading} />
            <StatCard label="Low Stock Items"  value={stats?.lowStockItems   ?? "—"} sub="<= 3 remaining"                         icon={AlertTriangle} color="amber"   href="/dashboard/inventory" loading={loading} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="glass" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dashboard/listings/new">
              <button className="btn btn-primary btn-sm"><Sparkles size={13} />New AI Listing</button>
            </Link>
            <Link href="/dashboard/listings">
              <button className="btn btn-secondary btn-sm"><Tag size={13} />View Listings</button>
            </Link>
            <Link href="/dashboard/orders">
              <button className="btn btn-secondary btn-sm"><ShoppingBag size={13} />View Orders</button>
            </Link>
            {shop.shopUrl && (
              <a href={shop.shopUrl} target="_blank" rel="noreferrer">
                <button className="btn btn-ghost btn-sm"><ExternalLink size={13} />View Etsy Shop</button>
              </a>
            )}
          </div>
        </div>

        {/* Connection status */}
        {shop.connected && (
          <div style={{ padding: "14px 18px", borderRadius: 10, background: "hsl(var(--status-success) / 0.08)", border: "1px solid hsl(var(--status-success) / 0.25)", display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle size={15} color="hsl(var(--status-success))" />
            <div style={{ fontSize: 13, color: "hsl(var(--text-secondary))" }}>
              <strong style={{ color: "hsl(var(--status-success))" }}>Etsy shop connected</strong>
              {shop.shopName && ` — ${shop.shopName}`}
              {" · "}All data is live from your Etsy account
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </>
  );
}

