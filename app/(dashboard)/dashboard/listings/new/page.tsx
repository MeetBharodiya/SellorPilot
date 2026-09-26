"use client";

import TopBar from "@/components/layout/TopBar";
import { useToast } from "@/components/ui/Toast";
import { SHOP_DEFAULTS } from "@/lib/shop/defaults";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  X,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle,
  Tag,
  FileText,
  DollarSign,
  Layers,
  AlertCircle,
  ExternalLink,
  Edit3,
  PenLine,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CATEGORY_LIST, getCategoryConfig, DEFAULT_CATEGORY } from "@/lib/categories/config";
import type { CategoryKey } from "@/lib/categories/config";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

interface AIResult {
  title: string;
  description: string;
  tags: string[];
  style: string;
  colors: string[];
  occasion: string;
  section: string;
}

type Step = "upload" | "manual_form" | "generating" | "result" | "saving" | "done";
type Mode = "ai" | "manual";

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepBar({ current, mode }: { current: Step; mode: Mode }) {
  const aiSteps:     { key: Step; label: string }[] = [
    { key: "upload",     label: "Upload Photos" },
    { key: "generating", label: "AI Analysis"   },
    { key: "result",     label: "Review"         },
    { key: "saving",     label: "Save to Etsy"   },
    { key: "done",       label: "Done!"           },
  ];
  const manualSteps: { key: Step; label: string }[] = [
    { key: "upload",      label: "Upload Photos"  },
    { key: "manual_form", label: "Fill Details"   },
    { key: "saving",      label: "Save to Etsy"   },
    { key: "done",        label: "Done!"           },
  ];
  const steps = mode === "manual" ? manualSteps : aiSteps;
  const idx   = steps.findIndex((s) => s.key === current);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {steps.map((step, i) => (
        <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, transition: "all 0.3s",
              background: i < idx ? "hsl(var(--status-success))" : i === idx ? "hsl(var(--brand-primary))" : "hsl(var(--bg-elevated))",
              color: i <= idx ? "white" : "hsl(var(--text-muted))",
              border: i > idx ? "1px solid hsl(var(--bg-border))" : "none",
            }}>
              {i < idx ? <CheckCircle size={14} /> : i + 1}
            </div>
            <div style={{ fontSize: 11, color: i === idx ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))", fontWeight: i === idx ? 600 : 400, whiteSpace: "nowrap" }}>
              {step.label}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < idx ? "hsl(var(--status-success))" : "hsl(var(--bg-border))", margin: "0 8px", marginBottom: 18, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Photo Upload Zone ────────────────────────────────────────────────────────
function PhotoUploadZone({
  photos, onAdd, onRemove
}: {
  photos: UploadedPhoto[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length) onAdd(files);
  }, [onAdd]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) onAdd(files);
    e.target.value = "";
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
          padding: "48px 24px", borderRadius: 16,
          border: `2px dashed ${dragging ? "hsl(var(--brand-primary))" : "hsl(var(--bg-border))"}`,
          background: dragging ? "hsl(var(--brand-primary) / 0.05)" : "hsl(var(--bg-elevated) / 0.4)",
          cursor: "pointer", transition: "all 0.2s", marginBottom: 20,
        }}
      >
        <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileInput} />
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, hsl(var(--brand-primary) / 0.15), hsl(var(--brand-secondary) / 0.1))", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid hsl(var(--brand-primary) / 0.25)" }}>
          <Upload size={28} color="hsl(var(--brand-primary))" strokeWidth={1.5} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 6 }}>
            {dragging ? "Drop photos here!" : "Upload nail photos"}
          </div>
          <div style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>
            Drag & drop or click to select · JPG, PNG, WEBP · Up to 10 photos
          </div>
        </div>
      </label>

      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
          {photos.map((photo, i) => (
            <div key={photo.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: i === 0 ? "2px solid hsl(var(--brand-primary))" : "1px solid hsl(var(--bg-border))" }}>
              <img src={photo.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {i === 0 && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "hsl(var(--brand-primary) / 0.85)", fontSize: 9, fontWeight: 700, color: "white", textAlign: "center", padding: "3px 0" }}>
                  COVER
                </div>
              )}
              <button
                onClick={() => onRemove(photo.id)}
                style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "hsl(0 72% 51% / 0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={11} color="white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tag Textarea ─────────────────────────────────────────────────────────────
// Parses a raw newline-separated string into cleaned Etsy tags.
function parseTagLines(raw: string): string[] {
  return raw
    .split("\n")
    .map(line => line.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").slice(0, 20))
    .filter(Boolean);
}

function TagTextarea({
  rawText,
  onRawChange,
}: {
  rawText: string;
  onRawChange: (raw: string) => void;
}) {
  const tags    = parseTagLines(rawText);
  const count   = tags.length;
  const overMax = count > 13;
  const exact   = count === 13;

  return (
    <div>
      <textarea
        className="input"
        style={{ minHeight: 220, fontSize: 13, lineHeight: 2.0, resize: "vertical", fontFamily: "inherit" }}
        placeholder={`Paste or type your 13 tags here — one per line:\n\npress-on-nails\nfloral-nails\nalmond-shape\npink-nails\nnail-art\nhandmade-nails\nreusable-nails\ncute-nails\nspring-nails\ngift-for-her\nfake-nails\nnail-set\nhome-manicure`}
        value={rawText}
        onChange={e => onRawChange(e.target.value)}
      />
      {/* Live parsed preview */}
      {tags.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 5 }}>
          {tags.map((tag, i) => (
            <span key={i} style={{
              padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500,
              background: i >= 13 ? "hsl(var(--status-error) / 0.15)" : "hsl(var(--brand-primary) / 0.12)",
              border: `1px solid ${i >= 13 ? "hsl(var(--status-error) / 0.4)" : "hsl(var(--brand-primary) / 0.3)"}`,
              color: i >= 13 ? "hsl(var(--status-error))" : "hsl(var(--text-primary))",
            }}>#{tag}</span>
          ))}
        </div>
      )}
      <div style={{
        marginTop: 8, fontSize: 12, fontWeight: 600,
        color: exact ? "hsl(var(--status-success))" : overMax ? "hsl(var(--status-error))" : "hsl(var(--text-muted))",
      }}>
        {exact && "✅ 13/13 tags — perfect!"}
        {!exact && !overMax && `${count}/13 tags — need ${13 - count} more`}
        {overMax && `${count}/13 — remove ${count - 13} extra tag${count - 13 > 1 ? "s" : ""} (tags after line 13 are highlighted in red)`}
      </div>
      <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 4 }}>
        Spaces → hyphens · max 20 chars per tag · special chars removed automatically
      </div>
    </div>
  );
}

// ─── Manual Form ──────────────────────────────────────────────────────────────
function ManualForm({
  photos,
  manualData,
  onChange,
  onSave,
  onBack,
}: {
  photos: UploadedPhoto[];
  manualData: { title: string; description: string; tags: string[]; tagsRaw: string };
  onChange: (field: "title" | "description" | "tagsRaw", value: any) => void;
  onSave: () => void;
  onBack: () => void;
}) {
  const titleLen    = manualData.title.length;
  const parsedTags  = parseTagLines(manualData.tagsRaw);
  const canSave     = manualData.title.trim().length > 0 && manualData.description.trim().length > 0 && parsedTags.length === 13;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
      {/* Left — form fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Title */}
        <div className="glass" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={14} color="hsl(var(--brand-primary))" />
              <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--text-muted))" }}>
                Listing Title <span style={{ color: "hsl(var(--status-error))" }}>*</span>
              </span>
            </div>
            <span style={{ fontSize: 11, color: titleLen > 130 ? "hsl(var(--status-warning))" : "hsl(var(--text-muted))" }}>{titleLen}/140</span>
          </div>
          <input
            className="input"
            style={{ fontSize: 14, fontWeight: 500 }}
            placeholder="e.g. Pink Floral Press-On Nails | Almond Shape | Reusable Set"
            value={manualData.title}
            onChange={e => onChange("title", e.target.value)}
            maxLength={140}
          />
          <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 6 }}>
            💡 Include nail style, color, shape & occasion for best SEO
          </div>
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
            style={{ minHeight: 260, fontSize: 13, lineHeight: 1.75, resize: "vertical", fontFamily: "inherit" }}
            placeholder={`Describe your nail set here...\n\nE.g.:\nBeautiful handcrafted pink floral press-on nails with delicate 3D flower details...\n\n✨ WHAT YOU'LL LOVE\n• Hand-painted floral design\n• Reusable with nail glue\n• Salon-quality finish at home`}
            value={manualData.description}
            onChange={e => onChange("description", e.target.value)}
          />
        </div>

        {/* Tags */}
        <div className="glass" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Tag size={14} color="hsl(var(--brand-secondary))" />
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--text-muted))" }}>
              Etsy Tags <span style={{ color: "hsl(var(--status-error))" }}>*</span> — exactly 13 required
            </span>
          </div>
          <TagTextarea rawText={manualData.tagsRaw} onRawChange={v => onChange("tagsRaw", v)} />
        </div>
      </div>

      {/* Right — summary sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Photos preview */}
        <div className="glass" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Photos · {photos.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {photos.slice(0, 6).map((p, i) => (
              <div key={p.id} style={{ aspectRatio: "1", borderRadius: 6, overflow: "hidden", border: i === 0 ? "2px solid hsl(var(--brand-primary))" : "1px solid hsl(var(--bg-border))" }}>
                <img src={p.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
            ))}
          </div>
        </div>

        {/* Auto-applied defaults */}
        <div className="glass" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Auto-Applied</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Price</span>
              <span style={{ fontWeight: 600 }}>₹{SHOP_DEFAULTS.pricing.regions.india.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Quantity</span>
              <span style={{ fontWeight: 600 }}>{SHOP_DEFAULTS.quantity}</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <div style={{ color: "hsl(var(--text-muted))", marginBottom: 4 }}>Sizes</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {SHOP_DEFAULTS.sizeVariant.options.filter(o => o.enabled).map(o => (
                  <span key={o.name} style={{ padding: "2px 6px", borderRadius: 4, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", fontSize: 10, color: "hsl(var(--text-secondary))" }}>{o.name}</span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 12 }}>
              <div style={{ color: "hsl(var(--text-muted))", marginBottom: 4 }}>Shapes</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {SHOP_DEFAULTS.shapeVariant.options.filter(o => o.enabled).map(o => (
                  <span key={o.name} style={{ padding: "2px 6px", borderRadius: 4, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", fontSize: 10, color: "hsl(var(--text-secondary))" }}>{o.name}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>State</span>
              <span style={{ fontWeight: 600, color: "hsl(var(--status-warning))" }}>Draft</span>
            </div>
          </div>
        </div>

        {/* Validation status */}
        <div className="glass" style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[
              { label: "Title",       ok: manualData.title.trim().length > 0       },
              { label: "Description", ok: manualData.description.trim().length > 0 },
              { label: "13 Tags",     ok: parsedTags.length === 13                  },
              { label: "Photos",      ok: photos.length > 0                         },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{ fontSize: 14 }}>{row.ok ? "✅" : "⬜"}</span>
                <span style={{ color: row.ok ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))" }}>{row.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ justifyContent: "center" }}>
          <ArrowLeft size={13} />Back to Photos
        </button>
        <button
          className="btn btn-primary"
          onClick={onSave}
          disabled={!canSave}
          style={{ justifyContent: "center", padding: "14px", opacity: canSave ? 1 : 0.55 }}
        >
          <Layers size={15} />Save as Etsy Draft
        </button>
        {!canSave && (
          <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", textAlign: "center" }}>
            {parsedTags.length < 13 ? `Add ${13 - parsedTags.length} more tag${13 - parsedTags.length > 1 ? "s" : ""}` : "Fill all required fields"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Generating Screen ────────────────────────────────────────────────────────
function GeneratingScreen({ photoCount }: { photoCount: number }) {
  const steps = [
    { icon: "🔍", text: "Analyzing nail art design...",       delay: 0    },
    { icon: "🎨", text: "Identifying colors & style...",      delay: 800  },
    { icon: "✍️", text: "Writing SEO-optimized title...",     delay: 1600 },
    { icon: "📝", text: "Crafting product description...",    delay: 2400 },
    { icon: "🏷️", text: "Generating 13 Etsy tags...",         delay: 3200 },
    { icon: "💰", text: "Applying shop pricing...",           delay: 3800 },
    { icon: "📐", text: "Adding size guide & variants...",    delay: 4200 },
  ];

  return (
    <div className="glass" style={{ padding: "48px 40px", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, hsl(var(--brand-primary) / 0.2), hsl(var(--brand-secondary) / 0.15))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <Sparkles size={36} color="hsl(var(--brand-primary))" strokeWidth={1.5} style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "hsl(var(--text-primary))", marginBottom: 8 }}>
        AI is analyzing your {photoCount} photo{photoCount > 1 ? "s" : ""}
      </div>
      <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", marginBottom: 36 }}>
        Gemini Vision is crafting your complete Etsy listing...
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, margin: "0 auto", textAlign: "left" }}>
        {steps.map((step, i) => (
          <div key={i} className="animate-fade-in" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", animationDelay: `${step.delay}ms`, opacity: 0, animationFillMode: "forwards" }}>
            <span style={{ fontSize: 18 }}>{step.icon}</span>
            <span style={{ fontSize: 13, color: "hsl(var(--text-secondary))", fontWeight: 500 }}>{step.text}</span>
            <RefreshCw size={12} color="hsl(var(--brand-primary))" style={{ marginLeft: "auto", animation: "spin 1s linear infinite", flexShrink: 0 }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.7; transform:scale(1.1); } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .animate-fade-in { animation: fadeInUp 0.4s ease forwards; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

// ─── Saving Screen ────────────────────────────────────────────────────────────
type StepStatus = "pending" | "loading" | "done" | "error";

function SavingScreen({
  photoCount,
  stepStatus,
  imageProgress,
}: {
  photoCount:    number;
  stepStatus:    Record<string, StepStatus>;
  imageProgress: { done: number; total: number } | null;
}) {
  const steps: { key: string; icon: string; text: string }[] = [
    { key: "shipping",  icon: "📋", text: "Fetching your shipping profile..."      },
    { key: "create",    icon: "🛍️", text: "Creating draft listing on Etsy..."      },
    { key: "images",    icon: "🖼️", text: imageProgress ? `Uploading photos (${imageProgress.done}/${imageProgress.total})...` : `Uploading ${photoCount} photo${photoCount > 1 ? "s" : ""}...` },
    { key: "inventory", icon: "📦", text: "Setting up size & shape variants..."    },
    { key: "finalise",  icon: "✨", text: "Finalising your listing..."              },
  ];

  const allDone = steps.every(s => stepStatus[s.key] === "done");

  return (
    <div className="glass" style={{ padding: "48px 40px", textAlign: "center" }}>
      <div style={{
        width: 80, height: 80, borderRadius: 24,
        background: allDone
          ? "linear-gradient(135deg, hsl(var(--status-success) / 0.25), hsl(var(--status-success) / 0.1))"
          : "linear-gradient(135deg, hsl(350 80% 55% / 0.2), hsl(var(--brand-primary) / 0.15))",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", transition: "background 0.4s",
      }}>
        <CheckCircle
          size={36}
          color={allDone ? "hsl(var(--status-success))" : "hsl(350 80% 65%)"}
          strokeWidth={1.5}
          style={{ animation: allDone ? "none" : "pulse 1.5s ease-in-out infinite" }}
        />
      </div>

      <div style={{ fontSize: 22, fontWeight: 800, color: "hsl(var(--text-primary))", marginBottom: 8 }}>
        {allDone ? "Almost there!" : "Saving to your Etsy shop…"}
      </div>
      <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", marginBottom: 36 }}>
        {allDone ? "Wrapping up, you'll be redirected shortly." : "Creating the draft and uploading your photos. Please wait."}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420, margin: "0 auto", textAlign: "left" }}>
        {steps.map((step) => {
          const status    = stepStatus[step.key] ?? "pending";
          const isPending = status === "pending";
          const isLoading = status === "loading";
          const isDone    = status === "done";
          const isError   = status === "error";

          return (
            <div
              key={step.key}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 10,
                background: isDone ? "hsl(var(--status-success) / 0.08)" : isError ? "hsl(var(--status-error) / 0.08)" : isLoading ? "hsl(var(--brand-primary) / 0.06)" : "hsl(var(--bg-elevated))",
                border: `1px solid ${isDone ? "hsl(var(--status-success) / 0.3)" : isError ? "hsl(var(--status-error) / 0.3)" : isLoading ? "hsl(var(--brand-primary) / 0.25)" : "hsl(var(--bg-border))"}`,
                opacity: isPending ? 0.4 : 1,
                transition: "all 0.35s ease",
              }}
            >
              <span style={{ fontSize: 18 }}>{step.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: "hsl(var(--text-secondary))", fontWeight: isDone ? 600 : 500 }}>{step.text}</span>
              {isDone    && <CheckCircle size={16} color="hsl(var(--status-success))" style={{ flexShrink: 0, animation: "popIn 0.3s ease" }} />}
              {isLoading && <RefreshCw   size={14} color="hsl(var(--brand-primary))"  style={{ flexShrink: 0, animation: "spin 0.9s linear infinite" }} />}
              {isError   && <span style={{ fontSize: 16, flexShrink: 0 }}>❌</span>}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)}  50%{opacity:.7;transform:scale(1.1)} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes popIn  { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}

// ─── Result Preview Card ──────────────────────────────────────────────────────
function ResultPreview({ result, photos, onRegenerate, onSave, saving, demo }: {
  result: AIResult;
  photos: UploadedPhoto[];
  onRegenerate: () => void;
  onSave: () => void;
  saving: boolean;
  demo: boolean;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(result.title);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {demo && (
          <div style={{ padding: "10px 16px", borderRadius: 8, background: "hsl(var(--status-warning) / 0.1)", border: "1px solid hsl(var(--status-warning) / 0.3)", display: "flex", gap: 10, alignItems: "center" }}>
            <AlertCircle size={14} color="hsl(var(--status-warning))" />
            <div style={{ fontSize: 12, color: "hsl(var(--text-secondary))" }}>
              <strong>Demo mode</strong> — Add your Gemini API key in Settings to generate real AI content from your photos
            </div>
          </div>
        )}

        <div className="glass" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <FileText size={14} color="hsl(var(--brand-primary))" />
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--text-muted))" }}>Title · {title.length}/140</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", padding: "2px 8px", fontSize: 11 }} onClick={() => setEditingTitle(!editingTitle)}>
              <Edit3 size={11} />{editingTitle ? "Done" : "Edit"}
            </button>
          </div>
          {editingTitle ? (
            <input className="input" style={{ fontSize: 14, fontWeight: 600 }} value={title} onChange={e => setTitle(e.target.value)} maxLength={140} />
          ) : (
            <div style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--text-primary))", lineHeight: 1.5 }}>{title}</div>
          )}
        </div>

        <div className="glass" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Tag size={14} color="hsl(var(--brand-secondary))" />
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--text-muted))" }}>Tags · {result.tags.length}/13</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {result.tags.map((tag, i) => (
              <span key={i} style={{ padding: "4px 10px", borderRadius: 6, background: "hsl(var(--brand-primary) / 0.1)", border: "1px solid hsl(var(--brand-primary) / 0.25)", fontSize: 12, fontWeight: 500, color: "hsl(var(--text-primary))" }}>#{tag}</span>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FileText size={14} color="hsl(var(--brand-primary))" />
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--text-muted))" }}>Description</span>
          </div>
          <textarea className="input" defaultValue={result.description} style={{ minHeight: 280, fontSize: 12, lineHeight: 1.8, resize: "vertical", fontFamily: "inherit" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="glass" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Photos · {photos.length}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {photos.slice(0, 6).map((p, i) => (
              <div key={p.id} style={{ aspectRatio: "1", borderRadius: 6, overflow: "hidden", border: i === 0 ? "2px solid hsl(var(--brand-primary))" : "1px solid hsl(var(--bg-border))" }}>
                <img src={p.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Auto-Applied Defaults</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Base Price</span>
              <span style={{ fontWeight: 600 }}>₹{SHOP_DEFAULTS.pricing.regions.india.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Quantity</span>
              <span style={{ fontWeight: 600 }}>{SHOP_DEFAULTS.quantity}</span>
            </div>
            <div style={{ fontSize: 12 }}>
              <div style={{ color: "hsl(var(--text-muted))", marginBottom: 4 }}>Sizes</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {SHOP_DEFAULTS.sizeVariant.options.filter(o => o.enabled).map(o => (
                  <span key={o.name} style={{ padding: "2px 6px", borderRadius: 4, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", fontSize: 10 }}>{o.name}</span>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 12 }}>
              <div style={{ color: "hsl(var(--text-muted))", marginBottom: 4 }}>Shapes</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {SHOP_DEFAULTS.shapeVariant.options.filter(o => o.enabled).map(o => (
                  <span key={o.name} style={{ padding: "2px 6px", borderRadius: 4, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", fontSize: 10 }}>{o.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="glass" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Analysis</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Style</span>
              <span style={{ fontWeight: 600, color: "hsl(var(--brand-primary))" }}>{result.style}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Occasion</span>
              <span style={{ fontWeight: 600 }}>{result.occasion}</span>
            </div>
            <div>
              <div style={{ color: "hsl(var(--text-muted))", marginBottom: 4 }}>Colors detected</div>
              <div style={{ display: "flex", gap: 4 }}>
                {result.colors.map(c => (
                  <span key={c} style={{ padding: "2px 8px", borderRadius: 99, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", fontSize: 11, textTransform: "capitalize" }}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button className="btn btn-ghost btn-sm" onClick={onRegenerate} style={{ justifyContent: "center" }}>
          <RefreshCw size={13} />Regenerate with AI
        </button>
        <button className="btn btn-primary" onClick={onSave} disabled={saving} style={{ justifyContent: "center", padding: "14px" }}>
          {saving ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />Saving...</> : <><Sparkles size={15} />Save as Etsy Draft</>}
        </button>
        <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", textAlign: "center" }}>
          Listing will be saved as draft on Etsy.
        </div>
      </div>
    </div>
  );
}

// ─── Done Screen ──────────────────────────────────────────────────────────────
function DoneScreen({ onNewListing }: { onNewListing: () => void }) {
  const router = useRouter();
  return (
    <div className="glass" style={{ padding: "60px 40px", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "hsl(var(--text-primary))", marginBottom: 8 }}>Draft saved to Etsy!</div>
      <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", marginBottom: 36 }}>
        Your listing has been created as a draft. Review it on Etsy and publish when ready.
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="btn btn-secondary" onClick={onNewListing}><Upload size={14} />New Listing</button>
        <button className="btn btn-primary" onClick={() => router.push("/dashboard/listings")}><Layers size={14} />View All Listings</button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewListingPage() {
  const { success, error: toastError } = useToast();

  const [mode,             setMode]             = useState<Mode>("ai");
  const [step,             setStep]             = useState<Step>("upload");
  const [photos,           setPhotos]           = useState<UploadedPhoto[]>([]);
  const [aiResult,         setAiResult]         = useState<AIResult | null>(null);
  const [isDemo,           setIsDemo]           = useState(false);
  const [etsyUrl,          setEtsyUrl]          = useState<string | null>(null);
  const [stepStatus,       setStepStatus]       = useState<Record<string, StepStatus>>({});
  const [imageProgress,    setImageProgress]    = useState<{ done: number; total: number } | null>(null);
  const [categoryKey,      setCategoryKey]      = useState<CategoryKey>(DEFAULT_CATEGORY);
  const [sellerDescription, setSellerDescription] = useState("");

  // Manual mode state
  const [manualData, setManualData] = useState({ title: "", description: "", tagsRaw: "" });

  const addPhotos = useCallback((files: File[]) => {
    const newPhotos = files.slice(0, 10 - photos.length).map((file) => ({
      id:      Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 10));
  }, [photos.length]);

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const removed = prev.find(p => p.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  // ── AI generate ────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (photos.length === 0) return;
    setStep("generating");
    try {
      const formData = new FormData();
      photos.forEach((p) => formData.append("images", p.file));
      formData.append("categoryKey", categoryKey);
      if (sellerDescription.trim()) formData.append("sellerDescription", sellerDescription.trim());

      const res  = await fetch("/api/ai/generate-listing", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setAiResult(data.result);
      setIsDemo(data.demo ?? false);
      setStep("result");
    } catch (err: any) {
      toastError("AI generation failed", err.message);
      setStep("upload");
    }
  };

  // ── Shared SSE save (used by both AI and manual modes) ─────────────────────
  const runSave = async (result: AIResult) => {
    setStepStatus({});
    setImageProgress(null);
    setStep("saving");

    try {
      const formData = new FormData();
      photos.forEach((p) => formData.append("images", p.file));
      formData.append("aiResult", JSON.stringify(result));
      formData.append("categoryKey", categoryKey);

      const res = await fetch("/api/ai/save-listing", { method: "POST", body: formData });
      if (!res.ok || !res.body) throw new Error("Connection to save endpoint failed");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let etsyListingUrl: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        for (const line of text.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));

            if (evt.step === "error") {
              toastError("Etsy save failed", evt.message);
              setStep(mode === "manual" ? "manual_form" : "result");
              return;
            }
            if (evt.step === "images" && evt.status === "progress") {
              setImageProgress({ done: evt.done, total: evt.total }); continue;
            }
            if (evt.step && evt.status) {
              setStepStatus(prev => ({ ...prev, [evt.step]: evt.status }));
            }
            if (evt.step === "finalise" && evt.status === "done") {
              etsyListingUrl = evt.etsyListingUrl ?? null;
            }
          } catch { /* malformed chunk */ }
        }
      }

      success("Draft saved to Etsy! 🎉", "Find it in your Etsy Seller Hub drafts to review and publish.");
      setEtsyUrl(etsyListingUrl);
      setStep("done");
    } catch (err: any) {
      toastError("Save failed", err.message);
      setStep(mode === "manual" ? "manual_form" : "result");
    }
  };

  // ── AI save ────────────────────────────────────────────────────────────────
  const handleAiSave = async () => {
    if (!aiResult) return;
    await runSave(aiResult);
  };

  // ── Manual save — builds AIResult shape from user input ───────────────────
  const handleManualSave = async () => {
    const result: AIResult = {
      title:       manualData.title,
      description: manualData.description,
      tags:        parseTagLines(manualData.tagsRaw),
      style:       "Manual",
      colors:      [],
      occasion:    "Everyday",
      section:     "Press-On Sets",
    };
    await runSave(result);
  };

  const handleNewListing = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setAiResult(null);
    setStepStatus({});
    setImageProgress(null);
    setSellerDescription("");
    setManualData({ title: "", description: "", tagsRaw: "" });
    setStep("upload");
  };

  return (
    <>
      <TopBar
        title="New Listing"
        subtitle={mode === "manual" ? "Fill in your listing details manually" : "Upload photos — AI writes everything else"}
        actions={
          <Link href="/dashboard/listings">
            <button className="btn btn-secondary btn-sm"><ArrowLeft size={13} />Back</button>
          </Link>
        }
      />

      <div style={{ padding: "28px 32px", maxWidth: 1000, flex: 1 }}>
        <StepBar current={step} mode={mode} />

        {/* ── Upload Step ─────────────────────────────────────────────────────── */}
        {step === "upload" && (
          <div>
            {/* Mode toggle */}
            <div className="glass" style={{ padding: "14px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", marginRight: 4 }}>Listing Mode:</span>
              <button
                onClick={() => setMode("ai")}
                className={mode === "ai" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                style={{ gap: 6 }}
              >
                <Sparkles size={13} />AI Generated
              </button>
              <button
                onClick={() => setMode("manual")}
                className={mode === "manual" ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                style={{ gap: 6 }}
              >
                <PenLine size={13} />Manual
              </button>
              <span style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginLeft: 4 }}>
                {mode === "ai"
                  ? "AI analyzes your photos and writes title, description & tags"
                  : "You write the title, description & tags — rest is auto-applied"}
              </span>
            </div>

            {/* Category selector */}
            <div className="glass" style={{ padding: "16px 24px", marginBottom: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", whiteSpace: "nowrap" }}>Product Category</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CATEGORY_LIST.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setCategoryKey(cat.key)}
                    className={categoryKey === cat.key ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
                    style={{ gap: 6 }}
                  >
                    <span>{cat.icon}</span>{cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo upload */}
            <div className="glass" style={{ padding: "28px 32px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <ImageIcon size={18} color="hsl(var(--brand-primary))" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--text-primary))" }}>Upload product photos</div>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>
                    {mode === "ai" ? "AI will analyze them and write your complete Etsy listing" : "These will be uploaded directly to your Etsy listing"}
                  </div>
                </div>
              </div>
              <PhotoUploadZone photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
            </div>

            {/* Seller description — only for AI mode */}
            {mode === "ai" && (() => {
              const cat = getCategoryConfig(categoryKey);
              return (
                <div className="glass" style={{ padding: "20px 24px", marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "hsl(var(--text-secondary))", display: "block", marginBottom: 8 }}>
                    {cat.descriptionLabel}
                    {cat.requiresDescription && <span style={{ color: "hsl(var(--status-error))", marginLeft: 4 }}>*</span>}
                  </label>
                  <textarea
                    value={sellerDescription}
                    onChange={e => setSellerDescription(e.target.value)}
                    placeholder={cat.descriptionPlaceholder}
                    rows={cat.requiresDescription ? 4 : 3}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))",
                      color: "hsl(var(--text-primary))", fontSize: 13, lineHeight: 1.6,
                      resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const,
                    }}
                  />
                  {!cat.requiresDescription && (
                    <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 4 }}>Optional — helps AI write more accurate content</div>
                  )}
                </div>
              );
            })()}

            {/* CTA button */}
            {photos.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
                {mode === "ai" && (() => {
                  const cat        = getCategoryConfig(categoryKey);
                  const canGenerate = !cat.requiresDescription || sellerDescription.trim().length > 0;
                  return (
                    <>
                      {!canGenerate && (
                        <span style={{ fontSize: 12, color: "hsl(var(--status-error))" }}>Please add a product description before generating</span>
                      )}
                      <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={!canGenerate}
                        style={{ padding: "14px 32px", fontSize: 15, gap: 10, opacity: canGenerate ? 1 : 0.5 }}
                      >
                        <Sparkles size={18} />Generate Listing with AI
                      </button>
                    </>
                  );
                })()}

                {mode === "manual" && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep("manual_form")}
                    style={{ padding: "14px 32px", fontSize: 15, gap: 10 }}
                  >
                    <PenLine size={18} />Fill Listing Details →
                  </button>
                )}
              </div>
            )}

            {photos.length === 0 && (
              <div className="glass" style={{ padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <AlertCircle size={16} color="hsl(var(--brand-secondary))" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", lineHeight: 1.6 }}>
                  {mode === "ai"
                    ? <><strong style={{ color: "hsl(var(--text-secondary))" }}>Tips for best AI results:</strong> Upload 3–5 photos from different angles · Good lighting helps AI detect colors accurately</>
                    : <><strong style={{ color: "hsl(var(--text-secondary))" }}>Manual mode:</strong> Upload your photos first, then you'll fill in the title, description and 13 Etsy tags yourself.</>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Manual Form Step ──────────────────────────────────────────────────── */}
        {step === "manual_form" && (
          <ManualForm
            photos={photos}
            manualData={manualData}
            onChange={(field, value) => setManualData(prev => ({ ...prev, [field]: value }))}
            onSave={handleManualSave}
            onBack={() => setStep("upload")}
          />
        )}

        {/* ── AI Generating ──────────────────────────────────────────────────────── */}
        {step === "generating" && <GeneratingScreen photoCount={photos.length} />}

        {/* ── Saving (SSE progress) ──────────────────────────────────────────────── */}
        {step === "saving" && (
          <SavingScreen photoCount={photos.length} stepStatus={stepStatus} imageProgress={imageProgress} />
        )}

        {/* ── AI Result / Review ────────────────────────────────────────────────── */}
        {step === "result" && aiResult && (
          <ResultPreview
            result={aiResult}
            photos={photos}
            onRegenerate={handleGenerate}
            onSave={handleAiSave}
            saving={false}
            demo={isDemo}
          />
        )}

        {/* ── Done ──────────────────────────────────────────────────────────────── */}
        {step === "done" && <DoneScreen onNewListing={handleNewListing} />}
      </div>
    </>
  );
}
