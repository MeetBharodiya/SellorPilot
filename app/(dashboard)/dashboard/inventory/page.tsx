"use client";

import TopBar from "@/components/layout/TopBar";
import { Boxes, AlertTriangle, Search, Edit3, TrendingDown } from "lucide-react";
import { useState } from "react";

const mockInventory = [
  { id: "1", listing: "Butterfly Pink Press-On Nails", section: "Press-On Sets", variations: [{ name: "Short", qty: 5, price: 10.99 }, { name: "Medium", qty: 15, price: 12.99 }, { name: "Long", qty: 3, price: 14.99 }], threshold: 5 },
  { id: "2", listing: "French Tips Bridal Set", section: "Custom Sets", variations: [{ name: "Natural", qty: 8, price: 18.50 }, { name: "Glitter Tips", qty: 2, price: 20.50 }], threshold: 3 },
  { id: "3", listing: "Holographic Glitter Nails", section: "Press-On Sets", variations: [{ name: "Standard", qty: 0, price: 14.99 }], threshold: 5 },
  { id: "4", listing: "Minimalist Nude Coffin Nails", section: "Press-On Sets", variations: [{ name: "Short", qty: 20, price: 11.00 }, { name: "Medium", qty: 18, price: 11.00 }, { name: "Long", qty: 12, price: 11.00 }], threshold: 5 },
  { id: "5", listing: "Cherry Blossom Spring Nails", section: "Press-On Sets", variations: [{ name: "Pastel Pink", qty: 7, price: 15.99 }, { name: "White", qty: 5, price: 15.99 }], threshold: 4 },
];

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const filtered = mockInventory.filter(i => i.listing.toLowerCase().includes(search.toLowerCase()));
  const lowStockCount = mockInventory.reduce((acc, item) =>
    acc + item.variations.filter(v => v.qty > 0 && v.qty <= item.threshold).length, 0);
  const outOfStockCount = mockInventory.reduce((acc, item) =>
    acc + item.variations.filter(v => v.qty === 0).length, 0);
  const totalVariations = mockInventory.reduce((acc, item) => acc + item.variations.length, 0);

  return (
    <>
      <TopBar
        title="Inventory"
        subtitle={`${lowStockCount} low stock · ${outOfStockCount} out of stock · ${totalVariations} total variations`}
      />
      <div style={{ padding: "20px 24px", flex: 1 }}>
        {/* Alerts */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {outOfStockCount > 0 && (
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "hsl(var(--status-error) / 0.1)", border: "1px solid hsl(var(--status-error) / 0.3)", display: "flex", alignItems: "center", gap: 10 }}>
                <TrendingDown size={16} color="hsl(var(--status-error))" />
                <div style={{ fontSize: 13, color: "hsl(var(--text-primary))" }}>
                  <strong>{outOfStockCount} variation{outOfStockCount > 1 ? "s" : ""}</strong> are completely out of stock
                </div>
              </div>
            )}
            {lowStockCount > 0 && (
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "hsl(var(--status-warning) / 0.1)", border: "1px solid hsl(var(--status-warning) / 0.3)", display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={16} color="hsl(var(--status-warning))" />
                <div style={{ fontSize: 13, color: "hsl(var(--text-primary))" }}>
                  <strong>{lowStockCount} variation{lowStockCount > 1 ? "s" : ""}</strong> are running low on stock
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 320, marginBottom: 16 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--text-muted))" }} />
          <input className="input" style={{ paddingLeft: 30, height: 36, fontSize: 13 }} placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="glass" style={{ overflow: "hidden" }}>
          <table className="table-base">
            <thead>
              <tr>
                <th>Listing</th>
                <th>Variation</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Alert At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item =>
                item.variations.map((variation, vi) => {
                  const isLow = variation.qty > 0 && variation.qty <= item.threshold;
                  const isOut = variation.qty === 0;
                  const cellKey = `${item.id}-${vi}`;
                  return (
                    <tr key={cellKey}>
                      {vi === 0 && (
                        <td rowSpan={item.variations.length} style={{ verticalAlign: "top", borderRight: "1px solid hsl(var(--bg-border))" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))", maxWidth: 200 }}>{item.listing}</div>
                          <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 2 }}>{item.section}</div>
                        </td>
                      )}
                      <td style={{ fontSize: 13, color: "hsl(var(--text-secondary))" }}>{variation.name}</td>
                      <td style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>${variation.price.toFixed(2)}</td>
                      <td>
                        {editingCell === cellKey ? (
                          <input
                            className="input"
                            type="number"
                            defaultValue={variation.qty}
                            style={{ width: 70, height: 28, fontSize: 13, padding: "4px 8px" }}
                            autoFocus
                            onBlur={() => setEditingCell(null)}
                          />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              className="font-display"
                              style={{ fontSize: 15, fontWeight: 700, color: isOut ? "hsl(var(--status-error))" : isLow ? "hsl(var(--status-warning))" : "hsl(var(--text-primary))" }}
                            >
                              {variation.qty}
                            </span>
                            <button className="btn btn-ghost btn-sm" style={{ padding: "2px 6px" }} onClick={() => setEditingCell(cellKey)}>
                              <Edit3 size={11} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${isOut ? "bg-red-500/20 text-red-400 border-red-500/30" : isLow ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>
                          {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      {vi === 0 && (
                        <td rowSpan={item.variations.length} style={{ verticalAlign: "top" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>Alert at</span>
                            <input
                              className="input"
                              type="number"
                              defaultValue={item.threshold}
                              style={{ width: 60, height: 28, fontSize: 13, padding: "4px 8px" }}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
