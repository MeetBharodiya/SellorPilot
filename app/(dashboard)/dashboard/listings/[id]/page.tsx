"use client";

import TopBar from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft, Save, Trash2, ExternalLink,
  Plus, X, Eye, RefreshCw, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getListingStateColor } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ListingForm {
  listing_id:   number;
  title:        string;
  description:  string;
  price:        string;
  quantity:     number;
  state:        string;
  tags:         string[];
  url:          string;
  views:        number;
  num_favorers: number;
  images:       { url_570xN: string; rank: number }[];
  last_modified_timestamp: number;
}

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim().toLowerCase().replace(/,/g, "").replace(/\s+/g, "-");
    if (v && !tags.includes(v) && tags.length < 13 && v.length <= 20) {
      onChange([...tags, v]); setInput("");
    }
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {tags.map(tag => (
          <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "hsl(var(--brand-primary) / 0.12)", border: "1px solid hsl(var(--brand-primary) / 0.3)", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "hsl(var(--text-primary))" }}>
            #{tag}
            <button onClick={() => onChange(tags.filter(t => t !== tag))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "hsl(var(--text-muted))", display: "flex" }}><X size={10} /></button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="input" style={{ fontSize: 13, height: 36 }}
          placeholder={tags.length >= 13 ? "Max 13 tags reached" : "Add tag + Enter..."}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }}}
          disabled={tags.length >= 13}
        />
        <button className="btn btn-secondary btn-sm" onClick={add} disabled={!input.trim() || tags.length >= 13}><Plus size={13} /></button>
      </div>
      <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 4 }}>{tags.length}/13 · max 20 chars each · use-hyphens-not-spaces</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ListingDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const { success, error: toastError, warning } = useToast();
  const id       = params.id as string;

  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState<string | null>(null);
  const [form,           setForm]           = useState<ListingForm | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState(false);

  // ── Fetch listing from real Etsy API ────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    fetch(`/api/etsy/listings/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setFetchError(data.error);
        } else {
          setForm({
            listing_id:              data.listing_id,
            title:                   data.title ?? "",
            description:             data.description ?? "",
            price:                   data.price
              ? String((data.price.amount / data.price.divisor).toFixed(2))
              : "0.00",
            quantity:                data.quantity ?? 0,
            state:                   data.state ?? "draft",
            tags:                    data.tags ?? [],
            url:                     data.url ?? "",
            views:                   data.views ?? 0,
            num_favorers:            data.num_favorers ?? 0,
            images:                  data.images ?? [],
            last_modified_timestamp: data.last_modified_timestamp ?? 0,
          });
        }
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field: keyof ListingForm, value: any) =>
    setForm(prev => prev ? { ...prev, [field]: value } : null);

  // ── Save changes ─────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!form) return;
    if (!form.title.trim() || form.title.length > 140) {
      toastError("Title is required and must be 140 chars or less"); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/etsy/listings/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          title:       form.title,
          description: form.description,
          tags:        form.tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      success("Listing updated!", "Changes saved to Etsy.");
    } catch (err: any) {
      toastError("Save failed", err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete listing ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      warning("Click Delete again to confirm", "This will permanently delete the listing from Etsy.");
      return;
    }
    setDeleting(true);
    try {
      await fetch(`/api/etsy/listings/${id}`, { method: "DELETE" });
      success("Listing deleted");
      router.push("/dashboard/listings");
    } catch (err: any) {
      toastError("Delete failed", err.message);
      setDeleting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <TopBar title="Loading Listing..." />
        <div style={{ padding: 64, textAlign: "center" }}>
          <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", color: "hsl(var(--brand-primary))", marginBottom: 12 }} />
          <div style={{ fontSize: 14, color: "hsl(var(--text-muted))" }}>Fetching listing from Etsy...</div>
        </div>
      </>
    );
  }

  // ── Error / not found state ───────────────────────────────────────────────────
  if (fetchError || !form) {
    return (
      <>
        <TopBar title="Listing Not Found" />
        <div style={{ padding: 48, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          <AlertCircle size={40} color="hsl(var(--status-error))" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 8 }}>
            Listing #{id} not found on Etsy
          </div>
          <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 24, lineHeight: 1.6 }}>
            {fetchError ?? "This listing may have been deleted from Etsy or the ID is invalid."}
          </div>
          <Link href="/dashboard/listings">
            <button className="btn btn-primary"><ArrowLeft size={14} />Back to Listings</button>
          </Link>
        </div>
      </>
    );
  }

  const titleLen      = form.title.length;
  const lastModified  = form.last_modified_timestamp
    ? new Date(form.last_modified_timestamp * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <>
      <TopBar
        title="Edit Listing"
        subtitle={`Etsy ID: ${form.listing_id} · ${form.views} views · ${form.num_favorers} favourites`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/dashboard/listings">
              <button className="btn btn-secondary btn-sm"><ArrowLeft size={13} />Back</button>
            </Link>
            {form.url && (
              <a href={form.url} target="_blank" rel="noopener noreferrer">
                <button className="btn btn-ghost btn-sm"><Eye size={13} />View on Etsy</button>
              </a>
            )}
          </div>
        }
      />

      <div style={{ padding: "24px 32px", maxWidth: 900, display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Status bar */}
        <div className="glass" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>Status:</span>
          <span className={`badge ${getListingStateColor(form.state)}`}>
            {form.state.replace("_", " ").replace(/^\w/, c => c.toUpperCase())}
          </span>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "hsl(var(--text-muted))" }}>
            Last updated: {lastModified}
          </div>
        </div>

        {/* Images preview */}
        {form.images.length > 0 && (
          <div className="glass" style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 12 }}>
              Photos ({form.images.length})
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {form.images
                .sort((a, b) => a.rank - b.rank)
                .map((img, i) => (
                  <img
                    key={i}
                    src={img.url_570xN}
                    alt={`Photo ${i + 1}`}
                    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid hsl(var(--bg-border))" }}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Listing Title <span style={{ color: "hsl(var(--status-error))" }}>*</span></span>
            <span style={{ color: titleLen > 140 ? "hsl(var(--status-error))" : "hsl(var(--text-muted))", fontWeight: 400 }}>{titleLen}/140</span>
          </div>
          <input
            className="input" style={{ fontSize: 14 }}
            value={form.title}
            onChange={e => set("title", e.target.value)}
            maxLength={140}
          />
        </div>

        {/* Description */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 8 }}>
            Description <span style={{ color: "hsl(var(--status-error))" }}>*</span>
          </div>
          <textarea
            className="input"
            style={{ minHeight: 240, fontSize: 13, lineHeight: 1.7, resize: "vertical" }}
            value={form.description}
            onChange={e => set("description", e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 12 }}>
            Tags ({form.tags.length}/13)
          </div>
          <TagInput tags={form.tags} onChange={t => set("tags", t)} />
        </div>

        {/* Stats */}
        <div className="glass" style={{ padding: "16px 20px", display: "flex", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "hsl(var(--text-primary))" }}>{form.views}</div>
            <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 2 }}>Views</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "hsl(var(--text-primary))" }}>{form.num_favorers}</div>
            <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 2 }}>Favourites</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "hsl(var(--text-primary))" }}>₹{Number(form.price).toLocaleString("en-IN")}</div>
            <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 2 }}>Price</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "hsl(var(--text-primary))" }}>{form.quantity}</div>
            <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 2 }}>Quantity</div>
          </div>
          {form.url && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
              <a href={form.url} target="_blank" rel="noopener noreferrer">
                <button className="btn btn-ghost btn-sm"><ExternalLink size={13} />Open on Etsy</button>
              </a>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="glass" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", bottom: 16 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              color:        confirmDelete ? "hsl(var(--status-error))" : "hsl(var(--text-muted))",
              borderColor:  confirmDelete ? "hsl(var(--status-error) / 0.4)" : "transparent",
              border:       "1px solid",
            }}
          >
            <Trash2 size={13} />
            {deleting ? "Deleting..." : confirmDelete ? "Confirm Delete?" : "Delete Listing"}
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/dashboard/listings">
              <button className="btn btn-ghost">Cancel</button>
            </Link>
            <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
              <Save size={14} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
