"use client";

import TopBar from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import {
  Plus, Search, Grid3x3, List, RefreshCw,
  Tag, Edit3, Trash2, Copy, Eye,
  Image as ImageIcon, Clock, CheckCircle2, XCircle,
  AlertCircle, PackageX, ExternalLink, Wifi, WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getListingStateColor } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Listing {
  listing_id:   number;
  title:        string;
  state:        "active" | "draft" | "inactive" | "expired" | "sold_out";
  price:        { amount: number; divisor: number; currency_code: string };
  quantity:     number;
  views:        number;
  tags:         string[];
  url:          string;
  images?:      { url_570xN: string }[];
  last_modified_timestamp: number;
}

const stateLabels: Record<string, string> = { active: "Active", draft: "Draft", inactive: "Inactive", sold_out: "Sold Out", expired: "Expired" };
const stateIcons:  Record<string, React.ElementType> = { active: CheckCircle2, draft: Clock, inactive: XCircle, sold_out: PackageX, expired: AlertCircle };

type ViewMode    = "grid" | "list";
type FilterState = "all" | "active" | "draft" | "inactive" | "sold_out";

function priceLabel(listing: Listing) {
  const val = listing.price.amount / listing.price.divisor;
  return `${listing.price.currency_code === "INR" ? "₹" : "$"}${val.toFixed(2)}`;
}

// ─── No Shop Banner ───────────────────────────────────────────────────────────
function NoShopBanner() {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <WifiOff size={48} strokeWidth={1} color="hsl(var(--text-muted))" style={{ margin: "0 auto 16px", display: "block" }} />
      <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 8 }}>No Etsy shop connected</div>
      <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", marginBottom: 24 }}>Connect your Etsy shop in Settings to see your real listings</div>
      <Link href="/dashboard/settings">
        <button className="btn btn-primary"><Wifi size={14} />Connect Etsy Shop</button>
      </Link>
    </div>
  );
}

// ─── Listing Card ─────────────────────────────────────────────────────────────
function ListingCard({ listing, onCopy, onDelete }: {
  listing: Listing;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const router   = useRouter();
  const imageUrl = listing.images?.[0]?.url_570xN;
  return (
    <div className="glass" style={{ padding: 0, overflow: "hidden", transition: "transform 0.15s ease", cursor: "pointer" }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}
      onClick={() => router.push(`/dashboard/listings/${listing.listing_id}`)}
    >
      <div style={{ height: 160, background: "linear-gradient(135deg, hsl(var(--bg-elevated)), hsl(var(--bg-overlay)))", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid hsl(var(--bg-border))", position: "relative", overflow: "hidden" }}>
        {imageUrl
          ? <img src={imageUrl} alt={listing.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <ImageIcon size={32} color="hsl(var(--text-muted))" strokeWidth={1.5} />
        }
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span className={`badge ${getListingStateColor(listing.state)}`}>{stateLabels[listing.state]}</span>
        </div>
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
          <button className="btn btn-secondary btn-sm" title="Edit" style={{ width: 28, height: 28, padding: 0 }}
            onClick={e => { e.stopPropagation(); router.push(`/dashboard/listings/${listing.listing_id}`); }}>
            <Edit3 size={12} />
          </button>
          <button className="btn btn-secondary btn-sm" title="View on Etsy" style={{ width: 28, height: 28, padding: 0 }}
            onClick={e => { e.stopPropagation(); window.open(listing.url, "_blank"); }}>
            <ExternalLink size={12} />
          </button>
        </div>
        {listing.quantity > 0 && listing.quantity <= 3 && (
          <div style={{ position: "absolute", bottom: 10, left: 10, background: "hsl(var(--status-warning) / 0.9)", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 600, color: "white" }}>
            ⚠ Low Stock: {listing.quantity} left
          </div>
        )}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 10 }}>
          {listing.title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span className="font-display" style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--text-primary))" }}>{priceLabel(listing)}</span>
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
          <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>#{listing.listing_id}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Listing Row ──────────────────────────────────────────────────────────────
function ListingRow({ listing, onDelete }: { listing: Listing; onDelete: () => void }) {
  const router   = useRouter();
  const StateIcon = stateIcons[listing.state] ?? CheckCircle2;
  return (
    <tr onClick={() => router.push(`/dashboard/listings/${listing.listing_id}`)} style={{ cursor: "pointer" }}>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))" }}>
            {listing.images?.[0]
              ? <img src={listing.images[0].url_570xN} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              : <ImageIcon size={18} color="hsl(var(--text-muted))" style={{ margin: "13px" }} />
            }
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{listing.title}</div>
            <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 2 }}>ID: {listing.listing_id}</div>
          </div>
        </div>
      </td>
      <td><span className={`badge ${getListingStateColor(listing.state)}`}><StateIcon size={10} style={{ marginRight: 4 }} />{stateLabels[listing.state]}</span></td>
      <td><span className="font-display" style={{ fontSize: 14, fontWeight: 700 }}>{priceLabel(listing)}</span></td>
      <td><span style={{ color: listing.quantity === 0 ? "hsl(var(--status-error))" : listing.quantity <= 3 ? "hsl(var(--status-warning))" : "hsl(var(--text-secondary))" }}>{listing.quantity === 0 ? "Out of stock" : listing.quantity}</span></td>
      <td><div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}><Eye size={12} />{listing.views}</div></td>
      <td style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>{new Date(listing.last_modified_timestamp * 1000).toLocaleDateString()}</td>
      <td>
        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => router.push(`/dashboard/listings/${listing.listing_id}`)}><Edit3 size={13} /></button>
          <button className="btn btn-ghost btn-sm" title="View on Etsy" onClick={() => window.open(listing.url, "_blank")}><ExternalLink size={13} /></button>
          <button className="btn btn-ghost btn-sm" title="Delete" style={{ color: "hsl(var(--status-error) / 0.7)" }} onClick={onDelete}><Trash2 size={13} /></button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ListingsPage() {
  const { success, info, warning, error: toastError } = useToast();
  const [listings, setListings]     = useState<Listing[]>([]);
  const [loading, setLoading]       = useState(true);
  const [noShop, setNoShop]         = useState(false);
  const [viewMode, setViewMode]     = useState<ViewMode>("grid");
  const [filterState, setFilterState] = useState<FilterState>("all");
  const [search, setSearch]         = useState("");
  const [syncing, setSyncing]       = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = filterState !== "all" ? `?state=${filterState}` : "";
      const res    = await fetch(`/api/etsy/listings${params}`);
      const data   = await res.json();

      if (res.status === 401) { setNoShop(true); return; }
      if (!res.ok) throw new Error(data.error);

      setNoShop(false);
      setListings(data.results ?? []);
    } catch (err: any) {
      toastError("Failed to load listings", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [filterState]);

  const handleSync = async () => {
    setSyncing(true);
    await fetchListings();
    setSyncing(false);
    success("Listings synced!", "Showing latest data from your Etsy shop.");
  };

  const handleDelete = async (listingId: number) => {
    if (!confirm(`Delete listing #${listingId}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/etsy/listings/${listingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setListings(prev => prev.filter(l => l.listing_id !== listingId));
      warning("Listing deleted", "Removed from Etsy permanently.");
    } catch (err: any) {
      toastError("Delete failed", err.message);
    }
  };

  const filtered = listings.filter(l => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const counts = {
    all:      listings.length,
    active:   listings.filter(l => l.state === "active").length,
    draft:    listings.filter(l => l.state === "draft").length,
    inactive: listings.filter(l => l.state === "inactive").length,
    sold_out: listings.filter(l => l.state === "sold_out").length,
  };

  if (noShop) return (
    <>
      <TopBar title="Listings" subtitle="No shop connected" actions={
        <Link href="/dashboard/listings/new"><button className="btn btn-primary btn-sm"><Plus size={14} />New Listing</button></Link>
      } />
      <NoShopBanner />
    </>
  );

  return (
    <>
      <TopBar
        title="Listings"
        subtitle={loading ? "Loading..." : `${counts.active} active · ${counts.draft} drafts · ${listings.length} total`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={syncing}>
              <RefreshCw size={13} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />Sync from Etsy
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
            <input className="input" style={{ paddingLeft: 32, height: 36, fontSize: 13 }} placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <button className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-secondary"}`} onClick={() => setViewMode("grid")} style={{ width: 32, height: 32, padding: 0 }}><Grid3x3 size={13} /></button>
            <button className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-secondary"}`} onClick={() => setViewMode("list")} style={{ width: 32, height: 32, padding: 0 }}><List size={13} /></button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "hsl(var(--text-muted))" }}>
            <RefreshCw size={32} strokeWidth={1} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
            <div>Loading your Etsy listings...</div>
            <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Grid */}
        {!loading && viewMode === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            <Link href="/dashboard/listings/new" style={{ textDecoration: "none" }}>
              <div style={{ border: "2px dashed hsl(var(--bg-border))", borderRadius: 12, minHeight: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}
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
              <ListingCard key={listing.listing_id} listing={listing} onCopy={() => info("Duplicate", "Coming soon")} onDelete={() => handleDelete(listing.listing_id)} />
            ))}
          </div>
        )}

        {/* List */}
        {!loading && viewMode === "list" && (
          <div className="glass" style={{ padding: 0, overflow: "hidden" }}>
            <table className="table-base">
              <thead><tr><th>Listing</th><th>Status</th><th>Price</th><th>Qty</th><th>Views</th><th>Updated</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(listing => (
                  <ListingRow key={listing.listing_id} listing={listing} onDelete={() => handleDelete(listing.listing_id)} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "hsl(var(--text-muted))" }}>
            <Tag size={40} strokeWidth={1} style={{ margin: "0 auto 12px", display: "block" }} />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No listings found</div>
            <div style={{ fontSize: 13 }}>Your Etsy listings will appear here</div>
          </div>
        )}
      </div>
    </>
  );
}
