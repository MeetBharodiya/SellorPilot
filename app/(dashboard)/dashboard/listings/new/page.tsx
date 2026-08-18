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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

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

type Step = "upload" | "generating" | "result" | "saving" | "done";

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepBar({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "upload",     label: "Upload Photos" },
    { key: "generating", label: "AI Analysis" },
    { key: "result",     label: "Review" },
    { key: "saving",     label: "Save to Etsy" },
    { key: "done",       label: "Done!" },
  ];
  const idx = steps.findIndex((s) => s.key === current);

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
      {/* Drop Zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "48px 24px",
          borderRadius: 16,
          border: `2px dashed ${dragging ? "hsl(var(--brand-primary))" : "hsl(var(--bg-border))"}`,
          background: dragging ? "hsl(var(--brand-primary) / 0.05)" : "hsl(var(--bg-elevated) / 0.4)",
          cursor: "pointer",
          transition: "all 0.2s",
          marginBottom: 20,
        }}
      >
        <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileInput} />
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "linear-gradient(135deg, hsl(var(--brand-primary) / 0.15), hsl(var(--brand-secondary) / 0.1))",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid hsl(var(--brand-primary) / 0.25)",
        }}>
          <Upload size={28} color="hsl(var(--brand-primary))" strokeWidth={1.5} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 6 }}>
            {dragging ? "Drop photos here!" : "Upload nail photos"}
          </div>
          <div style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>
            Drag & drop or click to select · JPG, PNG, WEBP · Up to 10 photos
          </div>
          <div style={{ fontSize: 12, color: "hsl(var(--text-muted))", marginTop: 4 }}>
            💡 More angles = better AI analysis
          </div>
        </div>
      </label>

      {/* Photo Thumbnails */}
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

// ─── Generating Screen ────────────────────────────────────────────────────────
function GeneratingScreen({ photoCount }: { photoCount: number }) {
  const steps = [
    { icon: "🔍", text: "Analyzing nail art design...",       delay: 0 },
    { icon: "🎨", text: "Identifying colors & style...",      delay: 800 },
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
      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {demo && (
          <div style={{ padding: "10px 16px", borderRadius: 8, background: "hsl(var(--status-warning) / 0.1)", border: "1px solid hsl(var(--status-warning) / 0.3)", display: "flex", gap: 10, alignItems: "center" }}>
            <AlertCircle size={14} color="hsl(var(--status-warning))" />
            <div style={{ fontSize: 12, color: "hsl(var(--text-secondary))" }}>
              <strong>Demo mode</strong> — Add your Gemini API key in Settings to generate real AI content from your photos
            </div>
          </div>
        )}

        {/* Title */}
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

        {/* Tags */}
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

        {/* Description */}
        <div className="glass" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FileText size={14} color="hsl(var(--brand-primary))" />
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "hsl(var(--text-muted))" }}>Description</span>
          </div>
          <textarea
            className="input"
            defaultValue={result.description}
            style={{ minHeight: 280, fontSize: 12, lineHeight: 1.8, resize: "vertical", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Photo strip */}
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
          <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Auto-Applied Defaults</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Base Price</span>
              <span style={{ fontWeight: 600, color: "hsl(var(--text-primary))" }}>₹{SHOP_DEFAULTS.pricing.regions.india.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>US Price</span>
              <span style={{ fontWeight: 600, color: "hsl(var(--text-primary))" }}>₹{SHOP_DEFAULTS.pricing.regions.us.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Quantity</span>
              <span style={{ fontWeight: 600, color: "hsl(var(--text-primary))" }}>{SHOP_DEFAULTS.quantity}</span>
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
              <span style={{ color: "hsl(var(--text-muted))" }}>Personalization</span>
              <span style={{ color: "hsl(var(--status-success))", fontWeight: 600 }}>✓ Enabled</span>
            </div>
          </div>
        </div>

        {/* AI insights */}
        <div className="glass" style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "hsl(var(--text-muted))", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Analysis</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Style</span>
              <span style={{ fontWeight: 600, color: "hsl(var(--brand-primary))" }}>{result.style}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Occasion</span>
              <span style={{ fontWeight: 600, color: "hsl(var(--text-primary))" }}>{result.occasion}</span>
            </div>
            <div>
              <div style={{ color: "hsl(var(--text-muted))", marginBottom: 4 }}>Colors detected</div>
              <div style={{ display: "flex", gap: 4 }}>
                {result.colors.map(c => (
                  <span key={c} style={{ padding: "2px 8px", borderRadius: 99, background: "hsl(var(--bg-elevated))", border: "1px solid hsl(var(--bg-border))", fontSize: 11, textTransform: "capitalize" }}>{c}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "hsl(var(--text-muted))" }}>Section</span>
              <span style={{ fontWeight: 600, color: "hsl(var(--text-primary))" }}>{result.section}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button className="btn btn-ghost btn-sm" onClick={onRegenerate} style={{ justifyContent: "center" }}>
          <RefreshCw size={13} />Regenerate with AI
        </button>
        <button className="btn btn-primary" onClick={onSave} disabled={saving} style={{ justifyContent: "center", padding: "14px" }}>
          {saving ? (
            <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />Saving to Etsy...</>
          ) : (
            <><Sparkles size={15} />Save as Etsy Draft</>
          )}
        </button>
        <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", textAlign: "center" }}>
          Listing will be saved as draft on Etsy. Review and publish when ready.
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
      <div style={{ fontSize: 24, fontWeight: 800, color: "hsl(var(--text-primary))", marginBottom: 8 }}>
        Draft saved to Etsy!
      </div>
      <div style={{ fontSize: 14, color: "hsl(var(--text-muted))", marginBottom: 36 }}>
        Your listing has been created as a draft. Review it on Etsy and publish when ready.
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button className="btn btn-secondary" onClick={onNewListing}>
          <Upload size={14} />New Listing
        </button>
        <button className="btn btn-primary" onClick={() => router.push("/dashboard/listings")}>
          <Layers size={14} />View All Listings
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewListingPage() {
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<Step>("upload");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [etsyUrl, setEtsyUrl] = useState<string | null>(null);

  const addPhotos = useCallback((files: File[]) => {
    const newPhotos = files.slice(0, 10 - photos.length).map((file) => ({
      id: Math.random().toString(36).slice(2),
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

  const handleGenerate = async () => {
    if (photos.length === 0) return;
    setStep("generating");

    try {
      const formData = new FormData();
      photos.forEach((p) => formData.append("images", p.file));

      const res = await fetch("/api/ai/generate-listing", {
        method: "POST",
        body: formData,
      });

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

  const handleSave = async () => {
    if (!aiResult) return;
    setStep("saving");

    try {
      const formData = new FormData();
      photos.forEach((p) => formData.append("images", p.file));
      formData.append("saveToEtsy", "true");

      const res  = await fetch("/api/ai/generate-listing", { method: "POST", body: formData });
      const data = await res.json();

      if (data.saved) {
        success("Draft saved to Etsy! 🎉", "Find it in your shop to review and publish.");
        setEtsyUrl(data.etsyListingUrl ?? null);
      } else if (data.saveError) {
        if (data.saveError.includes("No Etsy shop")) {
          toastError("Shop not connected", "Go to Settings → Connect Etsy Shop first.");
        } else {
          toastError("Etsy save failed", data.saveError);
        }
      }
      setStep("done");
    } catch (err: any) {
      toastError("Save failed", err.message);
      setStep("result");
    }
  };

  const handleNewListing = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setAiResult(null);
    setStep("upload");
  };

  return (
    <>
      <TopBar
        title="New Listing"
        subtitle="Upload photos — AI writes everything else"
        actions={
          <Link href="/dashboard/listings">
            <button className="btn btn-secondary btn-sm"><ArrowLeft size={13} />Back</button>
          </Link>
        }
      />

      <div style={{ padding: "28px 32px", maxWidth: 1000, flex: 1 }}>
        <StepBar current={step} />

        {/* Upload step */}
        {(step === "upload") && (
          <div>
            <div className="glass" style={{ padding: "28px 32px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <ImageIcon size={18} color="hsl(var(--brand-primary))" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--text-primary))" }}>Upload your nail photos</div>
                  <div style={{ fontSize: 13, color: "hsl(var(--text-muted))" }}>AI will analyze them and write your complete Etsy listing</div>
                </div>
              </div>
              <PhotoUploadZone photos={photos} onAdd={addPhotos} onRemove={removePhoto} />
            </div>

            {photos.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleGenerate}
                  style={{ padding: "14px 32px", fontSize: 15, gap: 10 }}
                >
                  <Sparkles size={18} />
                  Generate Listing with AI
                </button>
              </div>
            )}

            {photos.length === 0 && (
              <div className="glass" style={{ padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <AlertCircle size={16} color="hsl(var(--brand-secondary))" style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", lineHeight: 1.6 }}>
                  <strong style={{ color: "hsl(var(--text-secondary))" }}>Tips for best AI results:</strong> Upload 3–5 photos from different angles · Include close-ups of the nail art design · Good lighting helps AI detect colors accurately
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generating */}
        {step === "generating" && <GeneratingScreen photoCount={photos.length} />}

        {/* Result / Saving */}
        {(step === "result" || step === "saving") && aiResult && (
          <ResultPreview
            result={aiResult}
            photos={photos}
            onRegenerate={handleGenerate}
            onSave={handleSave}
            saving={step === "saving"}
            demo={isDemo}
          />
        )}

        {/* Done */}
        {step === "done" && <DoneScreen onNewListing={handleNewListing} />}
      </div>
    </>
  );
}
