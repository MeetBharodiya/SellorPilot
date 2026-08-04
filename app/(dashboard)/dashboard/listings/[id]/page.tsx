"use client";

import TopBar from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Save, Send, Trash2, ExternalLink, Plus, X, Edit3, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { getListingStateColor } from "@/lib/utils";

// Mock data — replace with real API fetch by ID
const MOCK_LISTINGS: Record<string, any> = {
  "1": { id: "1", title: "Handmade Press-On Nails | Butterfly Pink Set | Medium Length", price: "12.99", quantity: "15", state: "active", section: "Press-On Sets", shippingProfile: "Standard India Shipping", whoMade: "I did", whenMade: "Made to order", description: "Beautiful handcrafted butterfly pink press-on nails.\n\n🌸 What's included:\n• 24 nails in assorted sizes\n• Nail glue + prep pad", tags: ["press on nails", "butterfly", "pink nails", "nail art"], views: 142 },
  "2": { id: "2", title: "Custom Nail Art Set | French Tips | Short Length | Bridal", price: "18.50", quantity: "8", state: "active", section: "Custom Sets", shippingProfile: "Standard India Shipping", whoMade: "I did", whenMade: "Made to order", description: "Elegant french tip bridal nails, perfect for your special day.", tags: ["french tips", "bridal nails", "custom nails"], views: 89 },
  "3": { id: "3", title: "Holographic Glitter Press-On Nails | Festival Ready", price: "14.99", quantity: "0", state: "sold_out", section: "Press-On Sets", shippingProfile: "Standard India Shipping", whoMade: "I did", whenMade: "Made to order", description: "Dazzling holographic glitter nails for any festival or event.", tags: ["holographic", "glitter nails", "festival nails"], views: 230 },
  "4": { id: "4", title: "Minimalist Nude Coffin Nails | Everyday Wear", price: "11.00", quantity: "20", state: "draft", section: "Press-On Sets", shippingProfile: "Express Shipping", whoMade: "I did", whenMade: "Made to order", description: "Clean, minimalist nude nails for everyday elegance.", tags: ["nude nails", "coffin shape", "minimalist"], views: 0 },
  "5": { id: "5", title: "Gothic Black Stiletto Press-On Nails | Halloween", price: "13.99", quantity: "3", state: "inactive", section: "Special Editions", shippingProfile: "Standard India Shipping", whoMade: "I did", whenMade: "Made to order", description: "Dark and dramatic black stiletto nails.", tags: ["black nails", "stiletto", "halloween nails", "gothic"], views: 67 },
  "6": { id: "6", title: "Cherry Blossom Spring Nails | Sakura Nail Art Set", price: "15.99", quantity: "12", state: "active", section: "Press-On Sets", shippingProfile: "Standard India Shipping", whoMade: "I did", whenMade: "Made to order", description: "Delicate cherry blossom spring nails inspired by Japanese sakura.", tags: ["cherry blossom", "sakura", "spring nails", "floral"], views: 195 },
};

const ETSY_CATEGORIES = ["Press-On Sets", "Custom Sets", "Special Editions", "Nail Accessories", "Nail Care", "Gift Sets"];
const SHIPPING_PROFILES = ["Standard India Shipping", "Express Shipping", "Free Shipping (US Only)"];

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim().toLowerCase().replace(/,/g, "");
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
        <input className="input" style={{ fontSize: 13, height: 36 }} placeholder={tags.length >= 13 ? "Max 13 tags reached" : "Add tag + Enter..."} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }}} disabled={tags.length >= 13} />
        <button className="btn btn-secondary btn-sm" onClick={add} disabled={!input.trim() || tags.length >= 13}><Plus size={13} /></button>
      </div>
      <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 4 }}>{tags.length}/13 · max 20 chars each</div>
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: toastError, warning, info } = useToast();
  const id = params.id as string;

  const base = MOCK_LISTINGS[id];

  if (!base) {
    return (
      <>
        <TopBar title="Listing Not Found" />
        <div style={{ padding: 48, textAlign: "center", color: "hsl(var(--text-muted))" }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Listing #{id} not found</div>
          <div style={{ marginBottom: 20 }}>This listing may have been deleted or doesn't exist.</div>
          <Link href="/dashboard/listings">
            <button className="btn btn-primary"><ArrowLeft size={14} />Back to Listings</button>
          </Link>
        </div>
      </>
    );
  }

  const [form, setForm] = useState({ ...base });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  const handleUpdate = async () => {
    if (!form.title.trim() || form.title.length > 140) { toastError("Title is required and must be 140 chars or less"); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) { toastError("Enter a valid price"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    success("Listing updated!", "Changes saved successfully.");
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); warning("Click Delete again to confirm", "This action cannot be undone."); return; }
    setDeleting(true);
    await new Promise(r => setTimeout(r, 800));
    setDeleting(false);
    success("Listing deleted");
    router.push("/dashboard/listings");
  };

  const handleDeactivate = () => {
    set("state", form.state === "active" ? "inactive" : "active");
    info(form.state === "active" ? "Listing deactivated" : "Listing activated");
  };

  const titleLen = form.title?.length ?? 0;

  return (
    <>
      <TopBar
        title={`Edit Listing`}
        subtitle={`ID: ${id} · ${form.views} views`}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/dashboard/listings">
              <button className="btn btn-secondary btn-sm"><ArrowLeft size={13} />Back</button>
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={() => info("Live preview", "Preview will open Etsy listing once connected.")}>
              <Eye size={13} />Preview on Etsy
            </button>
          </div>
        }
      />

      <div style={{ padding: "24px", maxWidth: 860, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Status bar */}
        <div className="glass" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>Status:</span>
          <span className={`badge ${getListingStateColor(form.state)}`}>{form.state.replace("_", " ").replace(/^\w/, (c: string) => c.toUpperCase())}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleDeactivate}>
            {form.state === "active" ? "Deactivate" : "Activate"}
          </button>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "hsl(var(--text-muted))" }}>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Title */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Listing Title <span style={{ color: "hsl(var(--status-error))" }}>*</span></span>
            <span style={{ color: titleLen > 140 ? "hsl(var(--status-error))" : "hsl(var(--text-muted))", fontWeight: 400 }}>{titleLen}/140</span>
          </div>
          <input className="input" style={{ fontSize: 14 }} value={form.title} onChange={e => set("title", e.target.value)} maxLength={160} />
        </div>

        {/* Description */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 8 }}>Description <span style={{ color: "hsl(var(--status-error))" }}>*</span></div>
          <textarea className="input" style={{ minHeight: 180, fontSize: 13, lineHeight: 1.7, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} />
        </div>

        {/* Price, Qty, Section */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 14 }}>Pricing & Inventory</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>Price (USD) *</label>
              <input className="input" type="number" min="0.01" step="0.01" style={{ fontSize: 14 }} value={form.price} onChange={e => set("price", e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>Quantity</label>
              <input className="input" type="number" min="0" style={{ fontSize: 14 }} value={form.quantity} onChange={e => set("quantity", e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 6 }}>Section</label>
              <select className="input" style={{ fontSize: 13 }} value={form.section} onChange={e => set("section", e.target.value)}>
                {ETSY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 12 }}>Tags ({form.tags.length}/13)</div>
          <TagInput tags={form.tags} onChange={t => set("tags", t)} />
        </div>

        {/* Shipping */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 10 }}>Shipping Profile</div>
          <select className="input" style={{ fontSize: 13 }} value={form.shippingProfile} onChange={e => set("shippingProfile", e.target.value)}>
            {SHIPPING_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Action Bar */}
        <div className="glass" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", bottom: 16 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleDelete}
            disabled={deleting}
            style={{ color: confirmDelete ? "hsl(var(--status-error))" : "hsl(var(--text-muted))", borderColor: confirmDelete ? "hsl(var(--status-error) / 0.4)" : "transparent", border: "1px solid" }}
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
