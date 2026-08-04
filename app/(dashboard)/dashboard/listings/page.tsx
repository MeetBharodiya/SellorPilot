"use client";

import TopBar from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import {
  Plus, Search, Filter, Grid3x3, List, RefreshCw,
  Tag, Edit3, Trash2, Copy, Eye,
  Image as ImageIcon, Clock, CheckCircle2, XCircle,
  AlertCircle, PackageX,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getListingStateColor } from "@/lib/utils";

// ─── Mock Data ─────────────────────────────────────────────────────────────
const mockListings = [
  { id: "1", title: "Handmade Press-On Nails | Butterfly Pink Set | Medium Length", price: 12.99, quantity: 15, state: "active",   tags: ["press on nails", "butterfly", "pink nails", "nail art"], views: 142, updatedAt: "2026-08-03", section: "Press-On Sets" },
  { id: "2", title: "Custom Nail Art Set | French Tips | Short Length | Bridal",    price: 18.50, quantity: 8,  state: "active",   tags: ["french tips", "bridal nails", "custom nails"],            views: 89,  updatedAt: "2026-08-02", section: "Custom Sets" },
  { id: "3", title: "Holographic Glitter Press-On Nails | Festival Ready",          price: 14.99, quantity: 0,  state: "sold_out", tags: ["holographic", "glitter nails", "festival nails"],         views: 230, updatedAt: "2026-08-01", section: "Press-On Sets" },
  { id: "4", title: "Minimalist Nude Coffin Nails | Everyday Wear",                 price: 11.00, quantity: 20, state: "draft",    tags: ["nude nails", "coffin shape", "minimalist"],               views: 0,   updatedAt: "2026-08-04", section: "Press-On Sets" },
  { id: "5", title: "Gothic Black Stiletto Press-On Nails | Halloween",             price: 13.99, quantity: 3,  state: "inactive", tags: ["black nails", "stiletto", "halloween nails", "gothic"],   views: 67,  updatedAt: "2026-07-28", section: "Special Editions" },
  { id: "6", title: "Cherry Blossom Spring Nails | Sakura Nail Art Set",            price: 15.99, quantity: 12, state: "active",   tags: ["cherry blossom", "sakura", "spring nails", "floral"],    views: 195, updatedAt: "2026-08-04", section: "Press-On Sets" },
];

const stateLabels: Record<string, string> = { active: "Active", draft: "Draft", inactive: "Inactive", sold_out: "Sold Out", expired: "Expired" };
const stateIcons: Record<string, React.ElementType> = { active: CheckCircle2, draft: Clock, inactive: XCircle, sold_out: PackageX, expired: AlertCircle };

type ViewMode   = "grid" | "list";
type FilterState = "all" | "active" | "draft" | "inactive" | "sold_out";

// ─── Listing Card (Grid View) ──────────────────────────────────────────────
function ListingCard({ listing, onCopy, onDelete }: { listing: typeof mockListings[0]; onCopy: () => void; onDelete: () => void }) {
  const router = useRouter();
  return (
    <div className="glass" style={{ padding: 0, overflow: "hidden", transition: "transform 0.15s ease", cursor: "pointer" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}
      onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
    >
      {/* Image area */}
      <div style={{ height: 160, background: "linear-gradient(135deg, hsl(var(--bg-elevated)), hsl(var(--bg-overlay)))", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid hsl(var(--bg-border))", position: "relative" }}>
        <ImageIcon size={32} color="hsl(var(--text-muted))" strokeWidth={1.5} />

        {/* State badge */}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span className={`badge ${getListingStateColor(listing.state)}`}>{stateLabels[listing.state]}</span>
        </div>

        {/* Action buttons — stop propagation so they don't open the card */}
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
          <button
            className="btn btn-secondary btn-sm" title="Edit listing"
            style={{ width: 28, height: 28, padding: 0 }}
            onClick={e => { e.stopPropagation(); router.push(`/dashboard/listings/${listing.id}`); }}
          >
            <Edit3 size={12} />
          </button>
          <button
            className="btn btn-secondary btn-sm" title="Duplicate listing"
            style={{ width: 28, height: 28, padding: 0 }}
            onClick={e => { e.stopPropagation(); onCopy(); }}
          >
            <Copy size={12} />
          </button>
        </div>

        {/* Low stock */}
        {listing.quantity > 0 && listing.quantity <= 3 && (
          <div style={{ position: "absolute", bottom: 10, left: 10, background: "hsl(var(--status-warning) / 0.9)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600, color: "white" }}>
            ⚠ Low Stock: {listing.quantity} left
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 10 }}>
          {listing.title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--text-primary))" }}>${listing.price.toFixed(2)}</span>
          <span style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>
            Qty: <strong style={{ color: listing.quantity === 0 ? "hsl(var(--status-error))" : "hsl(var(--text-secondary))" }}>{listing.quantity}</strong>
          </span>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
          {listing.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "hsl(var(--bg-overlay))", color: "hsl(var(--text-muted))", border: "1px solid hsl(var(--bg-border))" }}>#{tag}</span>
          ))}
          {listing.tags.length > 2 && <span style={{ fontSize: 10, color: "hsl(var(--text-muted))" }}>+{listing.tags.length - 2}</span>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid hsl(var(--bg-border))", paddingTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "hsl(var(--text-muted))" }}><Eye size={11} />{listing.views} views</div>
          <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>{listing.section}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Listing Row (List View) ───────────────────────────────────────────────
function ListingRow({ listing, onCopy, onDelete }: { listing: typeof mockListings[0]; onCopy: () => void; onDelete: () => void }) {
  const router = useRouter();
  const StateIcon = stateIcons[listing.state] ?? CheckCircle2;
  return (
    <tr onClick={() => router.push(`/dashboard/listings/${listing.id}`)} style={{ cursor: "pointer" }}>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ImageIcon size={18} color="hsl(var(--text-muted))" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.title}</div>
            <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 2 }}>{listing.section}</div>
          </div>
        </div>
      </td>
      <td><span className={`badge ${getListingStateColor(listing.state)}`}><StateIcon size={10} style={{ marginRight: 4 }} />{stateLabels[listing.state]}</span></td>
      <td><span className="font-display" style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>${listing.price.toFixed(2)}</span></td>
      <td><span style={{ color: listing.quantity === 0 ? "hsl(var(--status-error))" : listing.quantity <= 3 ? "hsl(var(--status-warning))" : "hsl(var(--text-secondary))" }}>{listing.quantity === 0 ? "Out of stock" : listing.quantity}</span></td>
      <td><div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "hsl(var(--text-muted))" }}><Eye size={12} />{listing.views}</div></td>
      <td style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>{listing.updatedAt}</td>
      <td>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => router.push(`/dashboard/listings/${listing.id}`)}><Edit3 size={13} /></button>
          <button className="btn btn-ghost btn-sm" title="Duplicate" onClick={onCopy}><Copy size={13} /></button>
          <button className="btn btn-ghost btn-sm" title="Delete" style={{ color: "hsl(var(--status-error) / 0.7)" }} onClick={onDelete}><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const { success, info, warning } = useToast();
  const [viewMode, setViewMode]     = useState<ViewMode>("grid");
  const [filterState, setFilterState] = useState<FilterState>("all");
  const [search, setSearch]         = useState("");
  const [listings, setListings]     = useState(mockListings);

  const filtered = listings.filter(l => {
    const matchState  = filterState === "all" || l.state === filterState;
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.tags.some(t => t.includes(search.toLowerCase()));
    return matchState && matchSearch;
  });

  const counts = {
    all:      listings.length,
    active:   listings.filter(l => l.state === "active").length,
    draft:    listings.filter(l => l.state === "draft").length,
    inactive: listings.filter(l => l.state === "inactive").length,
    sold_out: listings.filter(l => l.state === "sold_out").length,
  };

  const handleCopy = (listing: typeof mockListings[0]) => {
    const copy = { ...listing, id: String(Date.now()), title: `${listing.title} (Copy)`, state: "draft", views: 0 };
    setListings(prev => [...prev, copy]);
    success("Listing duplicated!", "Copy saved as draft — review and publish when ready.");
  };

  const handleDelete = (id: string) => {
    setListings(prev => prev.filter(l => l.id !== id));
    warning("Listing deleted", "This is a local change — deletion will sync to Etsy once connected.");
  };

  const handleSync = () => {
    info("Syncing from Etsy...", "Connect your shop in Settings to enable live sync.");
  };

  return (
    <>
      <TopBar
        title="Listings"
        subtitle={`${counts.active} active · ${counts.draft} drafts · ${listings.length} total`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleSync}>
              <RefreshCw size={13} />Sync from Etsy
            </button>
            <Link href="/dashboard/listings/new">
              <button className="btn btn-primary btn-sm"><Plus size={14} />New Listing</button>
            </Link>
          </div>
        }
      />

      <div style={{ padding: "20px 24px", flex: 1 }}>
        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid hsl(var(--bg-border))" }}>
          {(["all", "active", "draft", "inactive", "sold_out"] as FilterState[]).map(state => (
            <button key={state} onClick={() => setFilterState(state)} style={{ padding: "8px 14px", fontSize: 13, fontWeight: filterState === state ? 600 : 400, color: filterState === state ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))", background: "transparent", border: "none", borderBottom: filterState === state ? "2px solid hsl(var(--brand-primary))" : "2px solid transparent", cursor: "pointer", transition: "all 0.15s", marginBottom: -1, textTransform: "capitalize", display: "flex", alignItems: "center", gap: 6 }}>
              {state === "all" ? "All" : stateLabels[state]}
              <span style={{ fontSize: 10, fontWeight: 700, background: filterState === state ? "hsl(var(--brand-primary) / 0.15)" : "hsl(var(--bg-elevated))", color: filterState === state ? "hsl(var(--brand-primary))" : "hsl(var(--text-muted))", borderRadius: 99, padding: "1px 6px" }}>{counts[state]}</span>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--text-muted))" }} />
            <input className="input" style={{ paddingLeft: 32, height: 36, fontSize: 13 }} placeholder="Search listings or tags..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <button className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-secondary"}`} onClick={() => setViewMode("grid")} style={{ width: 32, height: 32, padding: 0 }} title="Grid view"><Grid3x3 size={13} /></button>
            <button className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-secondary"}`} onClick={() => setViewMode("list")} style={{ width: 32, height: 32, padding: 0 }} title="List view"><List size={13} /></button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            <Link href="/dashboard/listings/new" style={{ textDecoration: "none" }}>
              <div style={{ border: "2px dashed hsl(var(--bg-border))", borderRadius: 12, minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--brand-primary) / 0.5)"; (e.currentTarget as HTMLDivElement).style.background = "hsl(var(--brand-primary) / 0.05)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--bg-border))"; (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "hsl(var(--brand-primary) / 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={20} color="hsl(var(--brand-primary))" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-muted))" }}>New Listing</div>
              </div>
            </Link>
            {filtered.map(listing => (
              <ListingCard key={listing.id} listing={listing} onCopy={() => handleCopy(listing)} onDelete={() => handleDelete(listing.id)} />
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
            <table className="table-base">
              <thead><tr><th>Listing</th><th>Status</th><th>Price</th><th>Quantity</th><th>Views</th><th>Updated</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(listing => (
                  <ListingRow key={listing.id} listing={listing} onCopy={() => handleCopy(listing)} onDelete={() => handleDelete(listing.id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "hsl(var(--text-muted))" }}>
            <Tag size={40} strokeWidth={1} style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No listings found</div>
            <div style={{ fontSize: 13 }}>Try adjusting your search or filter</div>
          </div>
        )}
      </div>
    </>
  );
}
