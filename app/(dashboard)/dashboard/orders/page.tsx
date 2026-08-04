"use client";

import TopBar from "@/components/layout/TopBar";
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  Eye,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ExternalLink,
  MapPin,
  User,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { getOrderStatusColor } from "@/lib/utils";

const mockOrders = [
  { id: "ORD-001", etsyId: "2841930012", buyer: "Sarah Johnson", email: "sarah@example.com", items: [{ title: "Butterfly Pink Press-On Nails", qty: 1, price: 12.99 }], total: 15.49, shipping: 2.50, status: "paid", address: "123 Oak St, New York, NY 10001", createdAt: "2026-08-04 09:22", tracking: null },
  { id: "ORD-002", etsyId: "2841820045", buyer: "Emma Williams", email: "emma@example.com", items: [{ title: "French Tips Bridal Set", qty: 1, price: 18.50 }, { title: "Nail Glue Extras", qty: 2, price: 3.00 }], total: 26.50, shipping: 3.00, status: "shipped", address: "45 Maple Ave, Los Angeles, CA 90001", createdAt: "2026-08-03 14:05", tracking: "9400111899225091234567" },
  { id: "ORD-003", etsyId: "2841710098", buyer: "Jessica Brown", email: "jess@example.com", items: [{ title: "Cherry Blossom Spring Nails", qty: 1, price: 15.99 }], total: 18.99, shipping: 3.00, status: "delivered", address: "78 Pine Rd, Chicago, IL 60601", createdAt: "2026-08-01 11:30", tracking: "9400111899225099876543" },
  { id: "ORD-004", etsyId: "2841600123", buyer: "Mia Davis", email: "mia@example.com", items: [{ title: "Holographic Glitter Nails", qty: 1, price: 14.99 }], total: 17.99, shipping: 3.00, status: "cancelled", address: "22 Birch Blvd, Houston, TX 77001", createdAt: "2026-07-30 16:45", tracking: null },
  { id: "ORD-005", etsyId: "2841500078", buyer: "Olivia Martinez", email: "olivia@example.com", items: [{ title: "Gothic Black Stiletto Nails", qty: 2, price: 13.99 }], total: 31.48, shipping: 3.50, status: "paid", address: "9 Cedar Ln, Phoenix, AZ 85001", createdAt: "2026-08-04 07:10", tracking: null },
];

type OrderStatus = "all" | "paid" | "shipped" | "delivered" | "cancelled";

const statusLabels: Record<string, string> = { paid: "Awaiting Shipment", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
const statusIcons: Record<string, React.ElementType> = { paid: Clock, shipped: Truck, delivered: CheckCircle2, cancelled: XCircle };

function OrderRow({ order, onClick, selected }: { order: typeof mockOrders[0]; onClick: () => void; selected: boolean }) {
  const StatusIcon = statusIcons[order.status];
  return (
    <tr onClick={onClick} style={{ cursor: "pointer" }}>
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
          {statusLabels[order.status]}
        </span>
      </td>
      <td>
        <span className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>
          ${order.total.toFixed(2)}
        </span>
      </td>
      <td>
        {order.status === "paid" && (
          <button className="btn btn-primary btn-sm" onClick={(e) => e.stopPropagation()}>
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

export default function OrdersPage() {
  const [filter, setFilter] = useState<OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = mockOrders.filter(o => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch = o.buyer.toLowerCase().includes(search.toLowerCase()) || o.etsyId.includes(search);
    return matchStatus && matchSearch;
  });

  const selectedOrder = mockOrders.find(o => o.id === selected);

  const counts = {
    all: mockOrders.length,
    paid: mockOrders.filter(o => o.status === "paid").length,
    shipped: mockOrders.filter(o => o.status === "shipped").length,
    delivered: mockOrders.filter(o => o.status === "delivered").length,
    cancelled: mockOrders.filter(o => o.status === "cancelled").length,
  };

  const revenue = mockOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  return (
    <>
      <TopBar title="Orders" subtitle={`${counts.paid} awaiting shipment · $${revenue.toFixed(2)} total revenue`} />

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
                <span className={`badge ${getOrderStatusColor(selectedOrder.status)}`}>{statusLabels[selectedOrder.status]}</span>
              </div>

              <div className="divider" />

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))", marginBottom: 8 }}>Buyer</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>{selectedOrder.buyer}</div>
                <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>{selectedOrder.email}</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))", marginBottom: 8 }}>Ship To</div>
                <div style={{ display: "flex", gap: 6, fontSize: 12, color: "hsl(var(--text-secondary))" }}>
                  <MapPin size={12} style={{ marginTop: 2, flexShrink: 0 }} />
                  {selectedOrder.address}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))", marginBottom: 8 }}>Items</div>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0", borderBottom: "1px solid hsl(var(--bg-border))" }}>
                    <span style={{ color: "hsl(var(--text-secondary))", flex: 1 }}>{item.title} ×{item.qty}</span>
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
