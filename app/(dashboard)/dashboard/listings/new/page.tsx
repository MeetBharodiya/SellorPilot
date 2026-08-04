"use client";

import TopBar from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft, Save, Send, Plus, X, Info, Image as ImageIcon,
  Tag, DollarSign, Package, FileText, Layers, Upload
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── Tag Input ────────────────────────────────────────────────────────────
function TagInput({
  tags, onChange, max = 13
}: { tags: string[]; onChange: (t: string[]) => void; max?: number }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim().toLowerCase().replace(/,/g, "");
    if (v && !tags.includes(v) && tags.length < max && v.length <= 20) {
      onChange([...tags, v]); setInput("");
    }
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, minHeight: 28 }}>
        {tags.map(tag => (
          <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "hsl(var(--brand-primary) / 0.12)", border: "1px solid hsl(var(--brand-primary) / 0.3)", borderRadius: 6, fontSize: 12, fontWeight: 500, color: "hsl(var(--text-primary))" }}>
            #{tag}
            <button onClick={() => onChange(tags.filter(t => t !== tag))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "hsl(var(--text-muted))", display: "flex" }}>
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="input" style={{ fontSize: 13, height: 36 }} placeholder={tags.length >= max ? `Max ${max} tags reached` : "Type a tag and press Enter..."} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }}} disabled={tags.length >= max} />
        <button className="btn btn-secondary btn-sm" onClick={add} disabled={!input.trim() || tags.length >= max}><Plus size={13} /></button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>{tags.length}/{max} tags · max 20 chars each · press Enter to add</span>
        {tags.some(t => t.length > 20) && <span style={{ fontSize: 11, color: "hsl(var(--status-error))" }}>Some tags exceed 20 chars</span>}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: "hsl(var(--brand-primary) / 0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color="hsl(var(--brand-primary))" />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>{subtitle}</div>}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────
function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", display: "flex", alignItems: "center", gap: 4 }}>
        {label} {required && <span style={{ color: "hsl(var(--status-error))" }}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>{hint}</span>}
      {error && <span style={{ fontSize: 11, color: "hsl(var(--status-error))" }}>⚠ {error}</span>}
    </div>
  );
}

const ETSY_CATEGORIES = ["Press-On Sets", "Custom Sets", "Special Editions", "Nail Accessories", "Nail Care", "Gift Sets"];
const SHIPPING_PROFILES = ["Standard India Shipping", "Express Shipping", "Free Shipping (US Only)"];
const WHO_MADE_OPTIONS = ["I did", "A member of my shop", "Someone else"];
const WHEN_MADE_OPTIONS = ["Made to order", "2020-2025", "2010-2019", "Before 2010"];

// ─── Page ─────────────────────────────────────────────────────────────────
export default function NewListingPage() {
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "1",
    section: "",
    shippingProfile: "",
    whoMade: "I did",
    whenMade: "Made to order",
    tags: [] as string[],
    state: "draft" as "draft" | "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.length > 140) e.title = "Title must be 140 characters or less";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) e.price = "Enter a valid price";
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) e.quantity = "Enter a valid quantity";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (asState: "draft" | "active") => {
    if (!validate()) {
      toastError("Fix the errors below before saving");
      return;
    }
    setSaving(true);
    set("state", asState);
    // Simulate API call — replace with real Etsy API call
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    success(
      asState === "active" ? "Listing published!" : "Draft saved!",
      asState === "active" ? "Your listing is now live on Etsy." : "You can publish it anytime from Listings."
    );
    setTimeout(() => router.push("/dashboard/listings"), 1500);
  };

  const titleLen = form.title.length;

  return (
    <>
      <TopBar
        title="New Listing"
        subtitle="Create a new product listing for your Etsy shop"
        actions={
          <Link href="/dashboard/listings">
            <button className="btn btn-secondary btn-sm">
              <ArrowLeft size={13} />
              Back to Listings
            </button>
          </Link>
        }
      />

      <div style={{ padding: "24px", maxWidth: 860, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Basic Info */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <SectionHeader icon={FileText} title="Basic Information" subtitle="Title, description, and pricing" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <Field label="Listing Title" required error={errors.title}>
              <div style={{ position: "relative" }}>
                <input className="input" style={{ fontSize: 14, paddingRight: 56 }} placeholder="e.g. Handmade Press-On Nails | Butterfly Pink Set | Medium Length" value={form.title} onChange={e => set("title", e.target.value)} maxLength={160} />
                <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: titleLen > 140 ? "hsl(var(--status-error))" : titleLen > 120 ? "hsl(var(--status-warning))" : "hsl(var(--text-muted))" }}>{titleLen}/140</span>
              </div>
              {titleLen > 140 && <span style={{ fontSize: 11, color: "hsl(var(--status-error))" }}>⚠ Exceeds Etsy's 140 character limit</span>}
            </Field>

            <Field label="Description" required error={errors.description} hint="Markdown supported. Describe your product, what's included, care instructions, etc.">
              <textarea className="input" style={{ minHeight: 200, fontSize: 13, lineHeight: 1.7, resize: "vertical" }} placeholder={"✨ Elevate your nail game with our handcrafted press-on nails!\n\n🌸 What's included:\n• 24 nails in assorted sizes\n• Nail glue + prep pad\n..."} value={form.description} onChange={e => set("description", e.target.value)} />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <Field label="Price (USD)" required error={errors.price}>
                <div style={{ position: "relative" }}>
                  <DollarSign size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "hsl(var(--text-muted))" }} />
                  <input className="input" type="number" min="0.01" step="0.01" style={{ paddingLeft: 28, fontSize: 14 }} placeholder="0.00" value={form.price} onChange={e => set("price", e.target.value)} />
                </div>
              </Field>

              <Field label="Quantity" required error={errors.quantity}>
                <input className="input" type="number" min="0" style={{ fontSize: 14 }} placeholder="1" value={form.quantity} onChange={e => set("quantity", e.target.value)} />
              </Field>

              <Field label="Shop Section">
                <select className="input" style={{ fontSize: 13 }} value={form.section} onChange={e => set("section", e.target.value)}>
                  <option value="">Select section...</option>
                  {ETSY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <SectionHeader icon={Tag} title="Tags" subtitle="Help buyers find your listing — Etsy allows up to 13 tags" />
          <TagInput tags={form.tags} onChange={t => set("tags", t)} max={13} />
          {form.tags.length === 0 && (
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>Suggestions:</span>
              {["press on nails", "nail art", "handmade nails", "custom nails", "gift for her"].map(s => (
                <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: "2px 8px", border: "1px solid hsl(var(--bg-border))" }} onClick={() => set("tags", [...form.tags, s])}>+ {s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <SectionHeader icon={ImageIcon} title="Photos" subtitle="Add up to 10 photos. First photo is the cover image." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {/* Upload zone */}
            <div
              style={{ gridColumn: "1 / 3", gridRow: "1 / 3", border: "2px dashed hsl(var(--bg-border))", borderRadius: 10, minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--brand-primary) / 0.5)"; (e.currentTarget as HTMLDivElement).style.background = "hsl(var(--brand-primary) / 0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--bg-border))"; (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <Upload size={22} color="hsl(var(--text-muted))" strokeWidth={1.5} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-muted))" }}>Cover Photo</div>
                <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 2 }}>Click to upload</div>
              </div>
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ border: "1px dashed hsl(var(--bg-border))", borderRadius: 8, aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "border-color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "hsl(var(--brand-primary) / 0.4)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "hsl(var(--bg-border))")}
              >
                <Plus size={16} color="hsl(var(--text-muted))" />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: "hsl(var(--text-muted))" }}>
            JPG, PNG, or GIF · Max 10MB per photo · Minimum 500×500 pixels recommended
          </div>
        </div>

        {/* Details */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <SectionHeader icon={Layers} title="Product Details" subtitle="Required by Etsy for all physical items" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Who made it?">
              <select className="input" style={{ fontSize: 13 }} value={form.whoMade} onChange={e => set("whoMade", e.target.value)}>
                {WHO_MADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="When was it made?">
              <select className="input" style={{ fontSize: 13 }} value={form.whenMade} onChange={e => set("whenMade", e.target.value)}>
                {WHEN_MADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Shipping */}
        <div className="glass" style={{ padding: "22px 24px" }}>
          <SectionHeader icon={Package} title="Shipping" />
          <Field label="Shipping Profile" hint="Manage profiles in Shipping settings">
            <select className="input" style={{ fontSize: 13 }} value={form.shippingProfile} onChange={e => set("shippingProfile", e.target.value)}>
              <option value="">Select a shipping profile...</option>
              {SHIPPING_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>

        {/* Action Bar */}
        <div className="glass" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", bottom: 16 }}>
          <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>
            {Object.keys(errors).length > 0
              ? <span style={{ color: "hsl(var(--status-error))" }}>⚠ {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""} — fix before publishing</span>
              : "All good — ready to save or publish"}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/dashboard/listings">
              <button className="btn btn-ghost">Cancel</button>
            </Link>
            <button className="btn btn-secondary" onClick={() => handleSave("draft")} disabled={saving}>
              <Save size={14} />
              {saving ? "Saving..." : "Save as Draft"}
            </button>
            <button className="btn btn-primary" onClick={() => handleSave("active")} disabled={saving}>
              <Send size={14} />
              {saving ? "Publishing..." : "Publish to Etsy"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
