"use client";

import TopBar from "@/components/layout/TopBar";
import { Boxes, AlertTriangle, Search, Edit3, TrendingDown, RefreshCw, WifiOff, Wifi } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { useShop } from "@/context/ShopContext";

interface InventoryItem {
  id: string;
  listing: string;
  section: string;
  variations: { name: string; qty: number; price: number }[];
  threshold: number;
}

function NoShopBanner() {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <WifiOff size={48} strokeWidth={1} color="hsl(var(--text-muted))" style={{ margin: "0 auto 16px", display: "block" }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 8 }}>No Etsy shop connected</div>
      <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", marginBottom: 24 }}>Connect your Etsy shop in Settings to see your inventory</div>
      <Link href="/dashboard/settings">
        <button className="btn btn-primary"><Wifi size={14} />Connect Etsy Shop</button>
      </Link>
    </div>
  );
}

export default function InventoryPage() {
  const { shop, loading: shopLoading } = useShop();
  const { error: toastError, success } = useToast();

  const [search, setSearch] = useState("");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/etsy/listings?state=active");
      if (!res.ok) throw new Error("Failed to fetch listings");
      const data = await res.json();
      
      const mapped: InventoryItem[] = (data.results || []).map((l: any) => ({
        id: String(l.listing_id),
        listing: l.title,
        section: "Active Listings",
        variations: [{
          name: "Standard",
          qty: l.quantity,
          price: l.price ? l.price.amount / l.price.divisor : 0
        }],
        threshold: 3
      }));
      setInventory(mapped);
    } catch (err: any) {
      toastError("Sync Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shopLoading && shop.connected) {
      fetchInventory();
    } else if (!shopLoading && !shop.connected) {
      setLoading(false);
    }
  }, [shop.connected, shop.id, shop.shopName, shopLoading]);

  const handleSync = async () => {
    setSyncing(true);
    await fetchInventory();
    setSyncing(false);
    success("Inventory synced!", "Showing latest stock counts from Etsy.");
  };

  if (shopLoading || loading) return <TopBar title="Inventory" subtitle="Loading inventory..." />;
  if (!shop.connected) return <><TopBar title="Inventory" subtitle="No shop connected" /><NoShopBanner /></>;

  const filtered = inventory.filter(i => i.listing.toLowerCase().includes(search.toLowerCase()));
  
  const lowStockCount = inventory.reduce((acc, item) =>
    acc + item.variations.filter(v => v.qty > 0 && v.qty <= item.threshold).length, 0);
    
  const outOfStockCount = inventory.reduce((acc, item) =>
    acc + item.variations.filter(v => v.qty === 0).length, 0);
    
  const totalVariations = inventory.reduce((acc, item) => acc + item.variations.length, 0);

  return (
    <>
      <TopBar
        title="Inventory"
        subtitle={`${lowStockCount} low stock · ${outOfStockCount} out of stock · ${totalVariations} total listings`}
        actions={
          <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={13} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
            Sync from Etsy
          </button>
        }
      />
      <div style={{ padding: "20px 24px", flex: 1 }}>
        {/* Alerts */}
        {(lowStockCount > 0 || outOfStockCount > 0) && (
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {outOfStockCount > 0 && (
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "hsl(var(--status-error) / 0.1)", border: "1px solid hsl(var(--status-error) / 0.3)", display: "flex", alignItems: "center", gap: 10 }}>
                <TrendingDown size={16} color="hsl(var(--status-error))" />
                <div style={{ fontSize: 13, color: "hsl(var(--text-primary))" }}>
                  <strong>{outOfStockCount} listing{outOfStockCount > 1 ? "s" : ""}</strong> are completely out of stock
                </div>
              </div>
            )}
            {lowStockCount > 0 && (
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, background: "hsl(var(--status-warning) / 0.1)", border: "1px solid hsl(var(--status-warning) / 0.3)", display: "flex", alignItems: "center", gap: 10 }}>
                <AlertTriangle size={16} color="hsl(var(--status-warning))" />
                <div style={{ fontSize: 13, color: "hsl(var(--text-primary))" }}>
                  <strong>{lowStockCount} listing{lowStockCount > 1 ? "s" : ""}</strong> are running low on stock
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
          
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 48, color: "hsl(var(--text-muted))" }}>
              <Boxes size={36} strokeWidth={1} style={{ margin: "0 auto 10px", display: "block" }} />
              <div>No inventory found</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
