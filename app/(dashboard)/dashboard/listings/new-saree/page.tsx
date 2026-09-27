"use client";

import TopBar from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowLeft, Upload, X, Image as ImageIcon, RefreshCw, CheckCircle,
  Tag, FileText, Layers, AlertCircle, ChevronDown, DollarSign, Plus, Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadedPhoto { id: string; file: File; preview: string; }
type SareeCategory = "sarees" | "lehengas";
type StepStatus = "pending" | "loading" | "done" | "error";

interface BlouseOption { name: string; price: number; }

interface SareeFormData {
  categoryKey:      SareeCategory;
  title:            string;
  description:      string;
  tagsRaw:          string;
  globalPrice:      number;
  section:          string;
  blouseStitching: {
    enabled:     boolean;
    optionsRaw:  string;              // one option per line
    prices:      Record<string, number>;
  };
  colours: {
    enabled:    boolean;
    optionsRaw: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseTagLines(raw: string): string[] {
  return raw
    .split("\n")
    .map(l => l.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").slice(0, 20))
    .filter(Boolean);
}

function parseLines(raw: string): string[] {
  return raw.split("\n").map(l => l.trim()).filter(Boolean);
}

// ─── Photo Upload Zone ────────────────────────────────────────────────────────
function PhotoUploadZone({ photos, onAdd, onRemove }: {
  photos: UploadedPhoto[]; onAdd: (f: File[]) => void; onRemove: (id: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length) onAdd(files);
  }, [onAdd]);

  return (
    <div>
      <label
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 12, padding: "40px 24px", borderRadius: 14,
          border: `2px dashed ${dragging ? "hsl(var(--brand-primary))" : "hsl(var(--bg-border))"}`,
          background: dragging ? "hsl(var(--brand-primary) / 0.05)" : "hsl(var(--bg-elevated) / 0.4)",
          cursor: "pointer", transition: "all 0.2s", marginBottom: 16,
        }}
      >
        <input type="file" accept="image/*" multiple style={{ display: "none" }}
          onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) onAdd(f); e.target.value = ""; }} />
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, hsl(var(--brand-primary) / 0.15), hsl(var(--brand-secondary) / 0.1))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid hsl(var(--brand-primary) / 0.25)" }}>
          <Upload size={24} color="hsl(var(--brand-primary))" strokeWidth={1.5} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 4 }}>
            {dragging ? "Drop photos here!" : "Upload product photos"}
          </div>
          <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>Drag & drop or click · JPG, PNG, WEBP · Up to 10 photos</div>
        </div>
      </label>
      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
          {photos.map((photo, i) => (
            <div key={photo.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: i === 0 ? "2px solid hsl(var(--brand-primary))" : "1px solid hsl(var(--bg-border))" }}>
              <img src={photo.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "hsl(var(--brand-primary) / 0.85)", fontSize: 9, fontWeight: 700, color: "white", textAlign: "center", padding: "2px 0" }}>COVER</div>}
              <button onClick={() => onRemove(photo.id)} style={{ position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%", background: "hsl(0 72% 51% / 0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={10} color="white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Saving Screen ────────────────────────────────────────────────────────────
function SavingScreen({ photoCount, stepStatus, imageProgress }: {
  photoCount: number;
  stepStatus: Record<string, StepStatus>;
  imageProgress: { done: number; total: number } | null;
}) {
  const steps = [
    { key: "shipping",  icon: "📋", text: "Fetching shipping profile..."       },
    { key: "create",    icon: "🛍️", text: "Creating draft listing on Etsy..."  },
    { key: "images",    icon: "🖼️", text: imageProgress ? `Uploading photos (${imageProgress.done}/${imageProgress.total})...` : `Uploading ${photoCount} photo${photoCount > 1 ? "s" : ""}...` },
    { key: "inventory", icon: "📦", text: "Setting up variants & pricing..."   },
    { key: "finalise",  icon: "✨", text: "Finalising listing..."               },
  ];
  const allDone = steps.every(s => stepStatus[s.key] === "done");

  return (
    <div className="glass" style={{ padding: "48px 40px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: allDone ? "linear-gradient(135deg, hsl(var(--status-success) / 0.25), hsl(var(--status-success) / 0.1))" : "linear-gradient(135deg, hsl(350 80% 55% / 0.2), hsl(var(--brand-primary) / 0.15))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", transition: "background 0.4s" }}>
        <CheckCircle size={32} color={allDone ? "hsl(var(--status-success))" : "hsl(350 80% 65%)"} strokeWidth={1.5} style={{ animation: allDone ? "none" : "pulse 1.5s ease-in-out infinite" }} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "hsl(var(--text-primary))", marginBottom: 6 }}>{allDone ? "Almost there!" : "Saving to Etsy…"}</div>
      <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 32 }}>{allDone ? "Wrapping up..." : "Please wait while we set up your listing."}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, maxWidth: 400, margin: "0 auto", textAlign: "left" }}>
        {steps.map(step => {
          const status = stepStatus[step.key] ?? "pending";
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: status === "done" ? "hsl(var(--status-success) / 0.08)" : status === "error" ? "hsl(var(--status-error) / 0.08)" : status === "loading" ? "hsl(var(--brand-primary) / 0.06)" : "hsl(var(--bg-elevated))", border: `1px solid ${status === "done" ? "hsl(var(--status-success) / 0.3)" : status === "error" ? "hsl(var(--status-error) / 0.3)" : status === "loading" ? "hsl(var(--brand-primary) / 0.25)" : "hsl(var(--bg-border))"}`, opacity: status === "pending" ? 0.4 : 1, transition: "all 0.3s" }}>
              <span style={{ fontSize: 16 }}>{step.icon}</span>
              <span style={{ flex: 1, fontSize: 12, color: "hsl(var(--text-secondary))", fontWeight: status === "done" ? 600 : 400 }}>{step.text}</span>
              {status === "done"    && <CheckCircle size={14} color="hsl(var(--status-success))" />}
              {status === "loading" && <RefreshCw   size={12} color="hsl(var(--brand-primary))"  style={{ animation: "spin 0.9s linear infinite" }} />}
              {status === "error"   && <span style={{ fontSize: 14 }}>❌</span>}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.7;transform:scale(1.1)} }
        @keyframes spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

// ─── Done Screen ──────────────────────────────────────────────────────────────
function DoneScreen({ onNew }: { onNew: () => void }) {
  const router = useRouter();
  return (
    <div className="glass" style={{ padding: "60px 40px", textAlign: "center" }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "hsl(var(--text-primary))", marginBottom: 8 }}>Draft saved to Etsy!</div>
      <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", marginBottom: 32 }}>Your listing is ready in Etsy Seller Hub as a draft. Review and publish when ready.</div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="btn btn-secondary" onClick={onNew}><Upload size={13} />New Listing</button>
        <button className="btn btn-primary" onClick={() => router.push("/dashboard/listings")}><Layers size={13} />View All Listings</button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const SAREE_SECTIONS   = ["Silk Sarees", "Cotton Sarees", "Designer Sarees", "Bridal Sarees"];
const LEHENGA_SECTIONS = ["Bridal Lehengas", "Party Wear Lehengas", "Designer Lehengas", "Embroidered Sets"];

export default function NewSareeListingPage() {
  const { success, error: toastError } = useToast();
  const router = useRouter();

  type Step = "form" | "saving" | "done";
  const [step,          setStep]          = useState<Step>("form");
  const [photos,        setPhotos]        = useState<UploadedPhoto[]>([]);
  const [stepStatus,    setStepStatus]    = useState<Record<string, StepStatus>>({});
  const [imageProgress, setImageProgress] = useState<{ done: number; total: number } | null>(null);

  const [form, setForm] = useState<SareeFormData>({
    categoryKey:     "sarees",
    title:           "",
    description:     "",
    tagsRaw:         "",
    globalPrice:     2500,
    section:         "Silk Sarees",
    blouseStitching: { enabled: false, optionsRaw: "Unstitched Blouse\nStitched Blouse", prices: { "Unstitched Blouse": 2500, "Stitched Blouse": 3200 } },
    colours:         { enabled: false, optionsRaw: "" },
  });

  const set = (path: string, value: any) => {
    setForm(prev => {
      const parts = path.split(".");
      if (parts.length === 1) return { ...prev, [parts[0]]: value };
      const top = parts[0] as keyof SareeFormData;
      return { ...prev, [top]: { ...(prev[top] as object), [parts[1]]: value } };
    });
  };

  const addPhotos = useCallback((files: File[]) => {
    const newPhotos = files.slice(0, 10 - photos.length).map(file => ({
      id: Math.random().toString(36).slice(2), file, preview: URL.createObjectURL(file),
    }));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
  }, [photos.length]);

  const removePhoto = (id: string) => {
    setPhotos(prev => { const r = prev.find(p => p.id === id); if (r) URL.revokeObjectURL(r.preview); return prev.filter(p => p.id !== id); });
  };

  // Derived
  const tags          = parseTagLines(form.tagsRaw);
  const blouseLines   = parseLines(form.blouseStitching.optionsRaw);
  const colourLines   = parseLines(form.colours.optionsRaw);
  const sections      = form.categoryKey === "lehengas" ? LEHENGA_SECTIONS : SAREE_SECTIONS;

  // Blouse options with prices (fill in default price if not set yet)
  const blouseOptions: BlouseOption[] = blouseLines.map(name => ({
    name,
    price: form.blouseStitching.prices[name] ?? (form.categoryKey === "lehengas" ? 4500 : 2500),
  }));

  const canSave = (
    form.title.trim().length > 0 &&
    form.description.trim().length > 0 &&
    tags.length === 13 &&
    photos.length > 0 &&
    (!form.blouseStitching.enabled || blouseLines.length > 0) &&
    (!form.colours.enabled || colourLines.length > 0)
  );

  const handleSave = async () => {
    setStepStatus({});
    setImageProgress(null);
    setStep("saving");

    const fd = new FormData();
    photos.forEach(p => fd.append("images", p.file));
    fd.append("title",       form.title);
    fd.append("description", form.description);
    fd.append("tags",        JSON.stringify(tags));
    fd.append("categoryKey", form.categoryKey);
    fd.append("globalPrice", String(form.globalPrice));
    fd.append("section",     form.section);

    if (form.blouseStitching.enabled && blouseOptions.length > 0) {
      fd.append("blouseOptions", JSON.stringify(blouseOptions));
    }
    if (form.colours.enabled && colourLines.length > 0) {
      fd.append("colourOptions", JSON.stringify(colourLines));
    }

    try {
      const res = await fetch("/api/ai/save-saree-listing", { method: "POST", body: fd });
      if (!res.ok || !res.body) throw new Error("Connection to save endpoint failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.step === "error") { toastError("Etsy save failed", evt.message); setStep("form"); return; }
            if (evt.step === "images" && evt.status === "progress") { setImageProgress({ done: evt.done, total: evt.total }); continue; }
            if (evt.step && evt.status) setStepStatus(prev => ({ ...prev, [evt.step]: evt.status }));
          } catch { /* skip */ }
        }
      }
      success("Draft saved to Etsy! 🎉", "Check Etsy Seller Hub drafts.");
      setStep("done");
    } catch (err: any) {
      toastError("Save failed", err.message);
      setStep("form");
    }
  };

  const handleNew = () => {
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setStepStatus({});
    setImageProgress(null);
    setForm(prev => ({ ...prev, title: "", description: "", tagsRaw: "", blouseStitching: { ...prev.blouseStitching, prices: {} }, }));
    setStep("form");
  };

  if (step === "saving") return (
    <>
      <TopBar title="New Listing" subtitle="Saving your saree/lehenga listing to Etsy…" actions={<Link href="/dashboard/listings"><button className="btn btn-secondary btn-sm"><ArrowLeft size={13} />Back</button></Link>} />
      <div style={{ padding: "28px 32px", maxWidth: 900, flex: 1 }}>
        <SavingScreen photoCount={photos.length} stepStatus={stepStatus} imageProgress={imageProgress} />
      </div>
    </>
  );

  if (step === "done") return (
    <>
      <TopBar title="New Listing" subtitle="Done!" actions={<Link href="/dashboard/listings"><button className="btn btn-secondary btn-sm"><ArrowLeft size={13} />Back</button></Link>} />
      <div style={{ padding: "28px 32px", maxWidth: 900, flex: 1 }}>
        <DoneScreen onNew={handleNew} />
      </div>
    </>
  );

  return (
    <>
      <TopBar
        title="New Listing — Parampara Couture"
        subtitle="Create a new saree or lehenga listing manually"
        actions={<Link href="/dashboard/listings"><button className="btn btn-secondary btn-sm"><ArrowLeft size={13} />Back</button></Link>}
      />

      <div style={{ padding: "28px 32px", maxWidth: 1000, flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

          {/* ── Left — main form ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Category + Section row */}
            <div className="glass" style={{ padding: "16px 20px", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))" }}>Category</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["sarees", "lehengas"] as SareeCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        const isLehenga = cat === "lehengas";
                        setForm(prev => ({
                          ...prev,
                          categoryKey:     cat,
                          section:         isLehenga ? LEHENGA_SECTIONS[0] : SAREE_SECTIONS[0],
                          globalPrice:     isLehenga ? 4500 : 2500,
                          blouseStitching: {
                            ...prev.blouseStitching,
                            prices: {
                              "Unstitched Blouse": isLehenga ? 4500 : 2500,
                              "Stitched Blouse":   isLehenga ? 5500 : 3200,
                            },
                          },
                        }));
                      }}
                      className={form.categoryKey === cat ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                      style={{ gap: 6 }}
                    >
                      {cat === "sarees" ? "🥻" : "👗"} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "hsl(var(--text-muted))" }}>Shop Section</label>
                <select
                  className="input" style={{ height: 34, fontSize: 13, paddingTop: 0, paddingBottom: 0, minWidth: 180 }}
                  value={form.section}
                  onChange={e => set("section", e.target.value)}
                >
                  {sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Photos */}
            <div className="glass" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <ImageIcon size={15} color="hsl(var(--brand-primary))" />
                <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>Product Photos</span>
                <span style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginLeft: 4 }}>(required)</span>
              </div>
              <PhotoUploadZone photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
            </div>

            {/* Title */}
            <div className="glass" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={14} color="hsl(var(--brand-primary))" />
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--text-muted))" }}>
                    Title <span style={{ color: "hsl(var(--status-error))" }}>*</span>
                  </span>
                </div>
                <span style={{ fontSize: 11, color: form.title.length > 130 ? "hsl(var(--status-warning))" : "hsl(var(--text-muted))" }}>{form.title.length}/140</span>
              </div>
              <input
                className="input" style={{ fontSize: 14, fontWeight: 500 }}
                placeholder={form.categoryKey === "lehengas" ? "e.g. Bridal Red Lehenga Choli | Heavy Embroidery | Wedding Wear | Indian Ethnic Set" : "e.g. Pure Banarasi Silk Saree | Gold Zari Border | Wedding & Festive Wear"}
                value={form.title}
                onChange={e => set("title", e.target.value)}
                maxLength={140}
              />
            </div>

            {/* Description */}
            <div className="glass" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <FileText size={14} color="hsl(var(--brand-primary))" />
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--text-muted))" }}>
                  Description <span style={{ color: "hsl(var(--status-error))" }}>*</span>
                </span>
              </div>
              <textarea
                className="input"
                style={{ minHeight: 220, fontSize: 13, lineHeight: 1.75, resize: "vertical", fontFamily: "inherit" }}
                placeholder={form.categoryKey === "lehengas"
                  ? "Describe your lehenga:\n\nFabric, embroidery details, what's included (choli, dupatta), sizing info, care instructions..."
                  : "Describe your saree:\n\nFabric, border, length, blouse details, occasion, care instructions..."}
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="glass" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Tag size={14} color="hsl(var(--brand-secondary))" />
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--text-muted))" }}>
                  Etsy Tags <span style={{ color: "hsl(var(--status-error))" }}>*</span> — exactly 13
                </span>
              </div>
              <textarea
                className="input"
                style={{ minHeight: 200, fontSize: 13, lineHeight: 2.0, resize: "vertical", fontFamily: "inherit" }}
                placeholder={"Paste 13 tags here — one per line:\n\nbanarasi-saree\nsilk-saree\nwedding-saree\nbridal-saree\nindian-saree\nfestive-saree\nzari-border\nhandwoven-saree\nsaree-for-women\ngift-for-bride\ntraditional-wear\netsy-india\nheavy-saree"}
                value={form.tagsRaw}
                onChange={e => set("tagsRaw", e.target.value)}
              />
              {/* Live tag preview */}
              {tags.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {tags.map((tag, i) => (
                    <span key={i} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: i >= 13 ? "hsl(var(--status-error) / 0.15)" : "hsl(var(--brand-primary) / 0.12)", border: `1px solid ${i >= 13 ? "hsl(var(--status-error) / 0.4)" : "hsl(var(--brand-primary) / 0.3)"}`, color: i >= 13 ? "hsl(var(--status-error))" : "hsl(var(--text-primary))" }}>#{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: tags.length === 13 ? "hsl(var(--status-success))" : tags.length > 13 ? "hsl(var(--status-error))" : "hsl(var(--text-muted))" }}>
                {tags.length === 13 ? "✅ 13/13 tags — perfect!" : tags.length > 13 ? `${tags.length}/13 — remove ${tags.length - 13} extra` : `${tags.length}/13 — need ${13 - tags.length} more`}
              </div>
            </div>

            {/* ── Variants Section ──────────────────────────────────────────── */}
            <div className="glass" style={{ padding: "20px 22px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 16 }}>
                📦 Variants (Optional)
              </div>

              {/* Blouse Stitching */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: form.blouseStitching.enabled ? 12 : 0 }}>
                  <button
                    onClick={() => set("blouseStitching.enabled", !form.blouseStitching.enabled)}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                      background: form.blouseStitching.enabled ? "hsl(var(--brand-primary))" : "hsl(var(--bg-border))",
                      position: "relative", transition: "background 0.2s", flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 3, left: form.blouseStitching.enabled ? 23 : 3,
                      width: 18, height: 18, borderRadius: "50%", background: "white",
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }} />
                  </button>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>Blouse Stitching</div>
                    <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>Enable to offer stitched & unstitched options with different prices</div>
                  </div>
                </div>

                {form.blouseStitching.enabled && (
                  <div style={{ paddingLeft: 56, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Options (one per line)</div>
                      <textarea
                        className="input"
                        style={{ minHeight: 80, fontSize: 13, lineHeight: 1.8, resize: "vertical", fontFamily: "inherit" }}
                        placeholder={"Stitched Blouse\nUnstitched Blouse"}
                        value={form.blouseStitching.optionsRaw}
                        onChange={e => set("blouseStitching.optionsRaw", e.target.value)}
                      />
                    </div>

                    {/* Price per option */}
                    {blouseLines.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Price per option (₹)</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {blouseLines.map(opt => (
                            <div key={opt} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ flex: 1, fontSize: 13, color: "hsl(var(--text-secondary))", fontWeight: 500 }}>{opt}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>₹</span>
                                <input
                                  type="number" className="input"
                                  style={{ width: 110, fontSize: 13, height: 34, textAlign: "right" }}
                                  value={form.blouseStitching.prices[opt] ?? (form.categoryKey === "lehengas" ? 4500 : 2500)}
                                  onChange={e => setForm(prev => ({
                                    ...prev,
                                    blouseStitching: {
                                      ...prev.blouseStitching,
                                      prices: { ...prev.blouseStitching.prices, [opt]: Number(e.target.value) }
                                    }
                                  }))}
                                  min={0}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Colours */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: form.colours.enabled ? 12 : 0 }}>
                  <button
                    onClick={() => set("colours.enabled", !form.colours.enabled)}
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                      background: form.colours.enabled ? "hsl(var(--brand-primary))" : "hsl(var(--bg-border))",
                      position: "relative", transition: "background 0.2s", flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 3, left: form.colours.enabled ? 23 : 3,
                      width: 18, height: 18, borderRadius: "50%", background: "white",
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }} />
                  </button>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-primary))" }}>Colours</div>
                    <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>Enable to list available colour options</div>
                  </div>
                </div>

                {form.colours.enabled && (
                  <div style={{ paddingLeft: 56 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>Colours (one per line)</div>
                    <textarea
                      className="input"
                      style={{ minHeight: 100, fontSize: 13, lineHeight: 1.8, resize: "vertical", fontFamily: "inherit" }}
                      placeholder={"Red\nRoyal Blue\nEmerald Green\nPeacock Green"}
                      value={form.colours.optionsRaw}
                      onChange={e => set("colours.optionsRaw", e.target.value)}
                    />
                    {colourLines.length > 0 && (
                      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {colourLines.map((c, i) => (
                          <span key={i} style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", color: "hsl(var(--text-secondary))" }}>{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right — sidebar ───────────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Photos preview */}
            {photos.length > 0 && (
              <div className="glass" style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Photos · {photos.length}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
                  {photos.slice(0, 6).map((p, i) => (
                    <div key={p.id} style={{ aspectRatio: "1", borderRadius: 6, overflow: "hidden", border: i === 0 ? "2px solid hsl(var(--brand-primary))" : "1px solid hsl(var(--bg-border))" }}>
                      <img src={p.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Global price (shown when no blouse stitching or as fallback) */}
            <div className="glass" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {form.blouseStitching.enabled ? "Fallback Price (₹)" : "Price (₹)"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, color: "hsl(var(--text-muted))" }}>₹</span>
                <input
                  type="number" className="input" style={{ fontSize: 16, fontWeight: 700, height: 40 }}
                  value={form.globalPrice}
                  onChange={e => set("globalPrice", Number(e.target.value))}
                  min={0}
                />
              </div>
              {form.blouseStitching.enabled && (
                <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 4 }}>Used as fallback if a stitching option has no price set</div>
              )}
            </div>

            {/* Checklist */}
            <div className="glass" style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Checklist</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { label: "Photos",      ok: photos.length > 0 },
                  { label: "Title",       ok: form.title.trim().length > 0 },
                  { label: "Description", ok: form.description.trim().length > 0 },
                  { label: "13 Tags",     ok: tags.length === 13 },
                  ...(form.blouseStitching.enabled ? [{ label: "Blouse Options", ok: blouseLines.length > 0 }] : []),
                  ...(form.colours.enabled         ? [{ label: "Colour Options",  ok: colourLines.length  > 0 }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <span style={{ fontSize: 14 }}>{row.ok ? "✅" : "⬜"}</span>
                    <span style={{ color: row.ok ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))" }}>{row.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variant summary */}
            {(form.blouseStitching.enabled || form.colours.enabled) && (
              <div className="glass" style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Variant Preview</div>
                {form.blouseStitching.enabled && blouseLines.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginBottom: 4 }}>Blouse Stitching ({blouseLines.length})</div>
                    {blouseLines.map((opt, i) => (
                      <div key={i} style={{ fontSize: 12, display: "flex", justifyContent: "space-between", padding: "2px 0", borderBottom: "1px solid hsl(var(--bg-border))" }}>
                        <span>{opt}</span>
                        <span style={{ fontWeight: 600, color: "hsl(var(--brand-primary))" }}>₹{(form.blouseStitching.prices[opt] ?? form.globalPrice).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                {form.colours.enabled && colourLines.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginBottom: 4 }}>Colours ({colourLines.length})</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {colourLines.map((c, i) => <span key={i} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))" }}>{c}</span>)}
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 8 }}>
                  {(form.blouseStitching.enabled && blouseLines.length > 0) || (form.colours.enabled && colourLines.length > 0)
                    ? `→ ${(form.blouseStitching.enabled ? Math.max(blouseLines.length, 1) : 1) * (form.colours.enabled ? Math.max(colourLines.length, 1) : 1)} variant${((form.blouseStitching.enabled ? Math.max(blouseLines.length, 1) : 1) * (form.colours.enabled ? Math.max(colourLines.length, 1) : 1)) > 1 ? "s" : ""} total`
                    : ""}
                </div>
              </div>
            )}

            {/* Save button */}
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!canSave}
              style={{ justifyContent: "center", padding: "14px", opacity: canSave ? 1 : 0.55 }}
            >
              <Layers size={15} />Save as Etsy Draft
            </button>
            {!canSave && (
              <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", textAlign: "center" }}>
                {tags.length < 13 ? `Add ${13 - tags.length} more tag${13 - tags.length !== 1 ? "s" : ""}` :
                 photos.length === 0 ? "Upload at least 1 photo" :
                 "Fill all required fields to continue"}
              </div>
            )}
            <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", textAlign: "center" }}>
              Saved as draft — review and publish in Etsy Seller Hub
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
