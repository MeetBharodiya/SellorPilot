"use client";

import TopBar from "@/components/layout/TopBar";
import {
  ShoppingBag, Search, Truck, CheckCircle2,
  XCircle, Clock, ExternalLink, MapPin, User,
  DollarSign, RefreshCw, WifiOff, Wifi
} from "lucide-react";
import { useState, useEffect } from "react";
import { getOrderStatusColor } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useShop } from "@/context/ShopContext";

type OrderStatus = "all" | "paid" | "shipped" | "delivered" | "cancelled";

const statusLabels: Record<string, string> = { paid: "Awaiting Shipment", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
const statusIcons: Record<string, React.ElementType> = { paid: Clock, shipped: Truck, delivered: CheckCircle2, cancelled: XCircle };

interface MappedOrder {
  id: string;
  etsyId: string;
  buyer: string;
  email: string;
  items: { title: string; qty: number; price: number }[];
  total: number;
  shipping: number;
  status: OrderStatus;
  address: string;
  createdAt: string;
  tracking: string | null;
}

function OrderRow({ order, onClick, selected }: { order: MappedOrder; onClick: () => void; selected: boolean }) {
  const StatusIcon = statusIcons[order.status] || Clock;
  return (
    <tr onClick={onClick} style={{ cursor: "pointer", background: selected ? "hsl(var(--bg-elevated))" : "transparent" }}>
      <td>
        <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-primary))" }}>#{order.etsyId}</div>
        <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>{order.createdAt}</div>
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "hsl(var(--bg-elevated))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={13} color="hsl(var(--text-muted))" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>{order.buyer}</div>
            <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>{order.items.length} item{order.items.length > 1 ? "s" : ""}</div>
          </div>
        </div>
      </td>
      <td>
        <div style={{ fontSize: 12, color: "hsl(var(--text-secondary))", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {order.items.map(i => i.title).join(", ")}
        </div>
      </td>
      <td>
        <span className={`badge ${getOrderStatusColor(order.status)}`}>
          <StatusIcon size={10} style={{ marginRight: 4 }} />
          {statusLabels[order.status] || order.status}
        </span>
      </td>
      <td>
        <span className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>
          ${order.total.toFixed(2)}
        </span>
      </td>
      <td>
        {order.status === "paid" && (
          <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <Truck size={12} />
            Mark Shipped
          </button>
        )}
        {order.status === "shipped" && order.tracking && (
          <button className="btn btn-secondary btn-sm" onClick={(e) => e.stopPropagation()}>
            <ExternalLink size={12} />
            Track
          </button>
        )}
      </td>
    </tr>
  );
}

function NoShopBanner() {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <WifiOff size={48} strokeWidth={1} color="hsl(var(--text-muted))" style={{ margin: "0 auto 16px", display: "block" }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 8 }}>No Etsy shop connected</div>
      <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", marginBottom: 24 }}>Connect your Etsy shop in Settings to see your orders</div>
      <Link href="/dashboard/settings">
        <button className="btn btn-primary"><Wifi size={14} />Connect Etsy Shop</button>
      </Link>
    </div>
  );
}

export default function OrdersPage() {
  const { shop, loading: shopLoading } = useShop();
  const { error, success } = useToast();
  
  const [filter, setFilter] = useState<OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<MappedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/etsy/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      
      const mapped: MappedOrder[] = (data.results || []).map((o: any) => {
        let status: OrderStatus = "paid";
        if (o.status?.toLowerCase() === "canceled") status = "cancelled";
        else if (o.is_shipped) status = "shipped";
        
        return {
          id: String(o.receipt_id),
          etsyId: String(o.receipt_id),
          buyer: o.name || "Unknown Buyer",
          email: o.buyer_email || "No email",
          items: (o.transactions || []).map((t: any) => ({
            title: t.title,
            qty: t.quantity,
            price: t.price.amount / t.price.divisor,
          })),
          total: o.grandtotal.amount / o.grandtotal.divisor,
          shipping: o.total_shipping_cost.amount / o.total_shipping_cost.divisor,
          status,
          address: `${o.shipping_address?.first_line}, ${o.shipping_address?.city}, ${o.shipping_address?.state} ${o.shipping_address?.zip}`,
          createdAt: new Date(o.create_timestamp * 1000).toLocaleString(),
          tracking: o.shipments?.[0]?.tracking_code || null,
        };
      });
      setOrders(mapped);
    } catch (err: any) {
      error("Sync Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shopLoading && shop.connected) {
      fetchOrders();
    } else if (!shopLoading && !shop.connected) {
      setLoading(false);
    }
  }, [shop.connected, shop.id, shop.shopName, shopLoading]);

  const handleSync = async () => {
    setSyncing(true);
    await fetchOrders();
    setSyncing(false);
    success("Orders synced!", "Showing latest orders from Etsy.");
  };

  if (shopLoading || loading) return <TopBar title="Orders" subtitle="Loading orders..." />;
  if (!shop.connected) return <><TopBar title="Orders" subtitle="No shop connected" /><NoShopBanner /></>;

  const filtered = orders.filter(o => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch = o.buyer.toLowerCase().includes(search.toLowerCase()) || o.etsyId.includes(search);
    return matchStatus && matchSearch;
  });

  const selectedOrder = orders.find(o => o.id === selected);

  const counts = {
    all: orders.length,
    paid: orders.filter(o => o.status === "paid").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  const revenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <>
      <TopBar 
        title="Orders" 
        subtitle={`${counts.paid} awaiting shipment · $${revenue.toFixed(2)} total revenue`} 
        actions={
          <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={13} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
            Sync from Etsy
          </button>
        }
      />

      <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Awaiting Shipment", value: counts.paid, icon: Clock, color: "hsl(var(--status-warning))" },
            { label: "Shipped", value: counts.shipped, icon: Truck, color: "hsl(var(--brand-primary))" },
            { label: "Delivered", value: counts.delivered, icon: CheckCircle2, color: "hsl(var(--status-success))" },
            { label: "Total Revenue", value: `$${revenue.toFixed(2)}`, icon: DollarSign, color: "hsl(var(--brand-secondary))" },
          ].map((s) => (
            <div key={s.label} className="glass" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <s.icon size={18} color={s.color} />
              <div>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--text-primary))" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid hsl(var(--bg-border))", paddingBottom: 0 }}>
          {(["all", "paid", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: "8px 14px", fontSize: 13, fontWeight: filter === s ? 600 : 400, color: filter === s ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))", background: "transparent", border: "none", borderBottom: filter === s ? "2px solid hsl(var(--brand-primary))" : "2px solid transparent", cursor: "pointer", marginBottom: -1, textTransform: "capitalize", display: "flex", alignItems: "center", gap: 6 }}>
              {s === "paid" ? "Awaiting" : s === "all" ? "All Orders" : s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={{ fontSize: 10, fontWeight: 700, background: filter === s ? "hsl(var(--brand-primary) / 0.15)" : "hsl(var(--bg-elevated))", color: filter === s ? "hsl(var(--brand-primary))" : "hsl(var(--text-muted))", borderRadius: 99, padding: "1px 6px" }}>{counts[s]}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap: 16, flex: 1 }}>
          {/* Orders table */}
          <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid hsl(var(--bg-border))" }}>
              <div style={{ position: "relative", maxWidth: 300 }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--text-muted))" }} />
                <input className="input" style={{ paddingLeft: 30, height: 34, fontSize: 13 }} placeholder="Search buyer or order ID..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <table className="table-base">
              <thead><tr><th>Order</th><th>Buyer</th><th>Items</th><th>Status</th><th>Total</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(order => (
                  <OrderRow key={order.id} order={order} onClick={() => setSelected(selected === order.id ? null : order.id)} selected={selected === order.id} />
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: "hsl(var(--text-muted))" }}>
                <ShoppingBag size={36} strokeWidth={1} style={{ margin: "0 auto 10px", display: "block" }} />
                <div>No orders found</div>
              </div>
            )}
          </div>

          {/* Order detail panel */}
          {selectedOrder && (
            <div className="glass" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>#{selectedOrder.etsyId}</div>
                  <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>{selectedOrder.createdAt}</div>
                </div>
                <span className={`badge ${getOrderStatusColor(selectedOrder.status)}`}>{statusLabels[selectedOrder.status] || selectedOrder.status}</span>
              </div>

              <div className="divider" />

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))", marginBottom: 8 }}>Buyer</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>{selectedOrder.buyer}</div>
                <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>{selectedOrder.email}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))", marginBottom: 8 }}>Ship To</div>
                <div style={{ display: "flex", gap: 6, fontSize: 12, color: "hsl(var(--text-secondary))", lineHeight: 1.4 }}>
                  <MapPin size={12} style={{ marginTop: 2, flexShrink: 0 }} />
                  {selectedOrder.address}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))", marginBottom: 8 }}>Items</div>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: "1px solid hsl(var(--bg-border))" }}>
                    <span style={{ color: "hsl(var(--text-secondary))", flex: 1, paddingRight: 8 }}>{item.title} ×{item.qty}</span>
                    <span style={{ fontWeight: 600, color: "hsl(var(--text-primary))" }}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8, fontWeight: 700, color: "hsl(var(--text-primary))" }}>
                  <span>Total</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.status === "paid" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))", marginBottom: 8 }}>Add Tracking</div>
                  <input className="input" style={{ fontSize: 13, height: 36, marginBottom: 8 }} placeholder="Tracking number..." />
                  <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    <Truck size={14} />
                    Mark as Shipped
                  </button>
                </div>
              )}

              {selectedOrder.tracking && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))", marginBottom: 8 }}>Tracking</div>
                  <div style={{ fontSize: 12, fontFamily: "monospace", background: "hsl(var(--bg-elevated))", padding: "8px 10px", borderRadius: 6, color: "hsl(var(--text-primary))", wordBreak: "break-all" }}>
                    {selectedOrder.tracking}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
