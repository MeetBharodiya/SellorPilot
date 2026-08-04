"use client";

import TopBar from "@/components/layout/TopBar";
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Tag, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const revenueData = [
  { month: "Mar", revenue: 0, orders: 0 },
  { month: "Apr", revenue: 0, orders: 0 },
  { month: "May", revenue: 0, orders: 0 },
  { month: "Jun", revenue: 0, orders: 0 },
  { month: "Jul", revenue: 89.45, orders: 5 },
  { month: "Aug", revenue: 110.45, orders: 5 },
];

const topListings = [
  { title: "Butterfly Pink Press-On Nails", revenue: 25.98, orders: 2, views: 142 },
  { title: "Cherry Blossom Spring Nails", revenue: 18.99, orders: 1, views: 195 },
  { title: "French Tips Bridal Set", revenue: 26.50, orders: 1, views: 89 },
  { title: "Gothic Black Stiletto Nails", revenue: 31.48, orders: 2, views: 67 },
  { title: "Holographic Glitter Nails", revenue: 17.99, orders: 1, views: 230 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
        <div style={{ fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 4 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }}>{p.name}: {p.name === "revenue" ? `$${p.value.toFixed(2)}` : p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <>
      <TopBar
        title="Analytics"
        subtitle="Revenue and performance insights built from your order data"
        actions={
          <button className="btn btn-secondary btn-sm">
            <RefreshCw size={13} />
            Refresh
          </button>
        }
      />
      <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Note banner */}
        <div style={{ padding: "10px 16px", borderRadius: 8, background: "hsl(var(--brand-secondary) / 0.08)", border: "1px solid hsl(var(--brand-secondary) / 0.2)", fontSize: 12, color: "hsl(var(--text-muted))" }}>
          📊 <strong style={{ color: "hsl(var(--text-secondary))" }}>Note:</strong> Etsy doesn't provide view/click analytics via API. Revenue & order data is synced from your shop. Connect your shop to see real data.
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "hsl(var(--status-success))" },
            { label: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag, color: "hsl(var(--brand-primary))" },
            { label: "Avg. Order Value", value: `$${avgOrderValue.toFixed(2)}`, icon: TrendingUp, color: "hsl(var(--brand-secondary))" },
          ].map(kpi => (
            <div key={kpi.label} className="glass" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${kpi.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={18} color={kpi.color} />
              </div>
              <div>
                <div className="font-display" style={{ fontSize: 24, fontWeight: 700, color: "hsl(var(--text-primary))" }}>{kpi.value}</div>
                <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
          {/* Revenue Chart */}
          <div className="glass" style={{ padding: "20px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 20 }}>Monthly Revenue</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(250 84% 65%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(250 84% 65%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 20%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="hsl(250 84% 65%)" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Listings */}
          <div className="glass" style={{ padding: "20px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 14 }}>Top Listings by Revenue</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topListings.map((l, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: 11, color: "hsl(var(--text-secondary))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>{l.title}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--text-primary))", flexShrink: 0 }}>${l.revenue.toFixed(2)}</div>
                  </div>
                  <div style={{ height: 4, background: "hsl(var(--bg-elevated))", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(l.revenue / topListings[0].revenue) * 100}%`, background: "linear-gradient(90deg, hsl(var(--brand-primary)), hsl(var(--brand-secondary)))", borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 10, color: "hsl(var(--text-muted))" }}>{l.orders} orders · {l.views} views</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="glass" style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 20 }}>Monthly Orders</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 25% 20%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215 15% 45%)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="orders" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
