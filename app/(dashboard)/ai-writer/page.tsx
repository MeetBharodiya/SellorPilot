"use client";

import TopBar from "@/components/layout/TopBar";
import {
  Sparkles,
  Wand2,
  Tag,
  FileText,
  Copy,
  Check,
  RefreshCw,
  ChevronRight,
  Info,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";

const EXAMPLE_KEYWORDS = [
  "press on nails",
  "butterfly",
  "pink",
  "medium length",
  "handmade",
];

const STYLE_OPTIONS = ["Elegant", "Cute", "Bold", "Minimalist", "Trendy", "Seasonal"];
const AUDIENCE_OPTIONS = ["Teens", "Young Adults", "Brides", "Festival-goers", "Professionals", "Gift Buyers"];

// ─── Tag Input ─────────────────────────────────────────────────────────────
function TagInput({
  tags,
  onChange,
  placeholder,
  max,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  max: number;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const val = input.trim().toLowerCase();
    if (val && !tags.includes(val) && tags.length < max) {
      onChange([...tags, val]);
      setInput("");
    }
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {tags.map((tag) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 8px",
              background: "hsl(var(--brand-primary) / 0.12)",
              border: "1px solid hsl(var(--brand-primary) / 0.3)",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: "hsl(var(--text-primary))",
            }}
          >
            #{tag}
            <button
              onClick={() => removeTag(tag)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "hsl(var(--text-muted))" }}
            >
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="input"
          style={{ fontSize: 13, height: 36 }}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
          disabled={tags.length >= max}
        />
        <button className="btn btn-secondary btn-sm" onClick={addTag} disabled={!input.trim() || tags.length >= max}>
          <Plus size={13} />
        </button>
      </div>
      <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginTop: 4 }}>
        {tags.length}/{max} · Press Enter or comma to add
      </div>
    </div>
  );
}

// ─── Copy Button ───────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="btn btn-ghost btn-sm" onClick={copy} title="Copy to clipboard">
      {copied ? <Check size={13} color="hsl(var(--status-success))" /> : <Copy size={13} />}
    </button>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function AIWriterPage() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [style, setStyle] = useState("");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; description: string; tags: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState<"title" | "description" | "tags">("title");

  // Simulated generation (replace with real AI call once backend is ready)
  const generate = async () => {
    if (keywords.length === 0) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 2200));
    setResult({
      title: `Handmade ${keywords.slice(0, 3).map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(" ")} Press-On Nails | ${style || "Trendy"} Style | Perfect for ${audience || "Any Occasion"}`,
      description: `✨ Elevate your nail game with our handcrafted ${keywords[0] || "press-on"} nails!\n\n🌸 **What's Included:**\n• 1 full set of 24 nails in assorted sizes\n• Nail glue + prep pad\n• Easy application instructions\n\n💅 **Why You'll Love Them:**\n• Salon-quality finish at home\n• Lasts 1-2 weeks with proper application\n• Gentle on natural nails\n• Fully reusable with nail glue\n\n📦 **Shipping:**\nAll orders ship in protective packaging within 1-3 business days.\n\n💬 **Custom Orders Welcome!**\nLooking for a specific design? Message us and we'll create your dream nails!\n\n#nails #${keywords.join(" #")}`,
      tags: [
        ...keywords.slice(0, 5),
        "press on nails",
        "handmade nails",
        "nail art",
        "custom nails",
        style?.toLowerCase() || "trendy nails",
        "nail accessories",
        audience?.toLowerCase() || "gift for her",
        "etsy nails",
      ].slice(0, 13),
    });
    setLoading(false);
  };

  return (
    <>
      <TopBar
        title="AI Listing Writer"
        subtitle="Generate SEO-optimized titles, descriptions & tags with AI"
      />

      <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, flex: 1 }}>

        {/* Left — Input Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="glass" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "hsl(var(--brand-primary) / 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Wand2 size={16} color="hsl(var(--brand-primary))" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--text-primary))" }}>Describe Your Product</div>
                <div style={{ fontSize: 11, color: "hsl(var(--text-muted))" }}>AI will write a full optimized listing</div>
              </div>
            </div>

            {/* Keywords */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 8, letterSpacing: "0.02em" }}>
                Keywords / Product Features *
              </label>
              <TagInput
                tags={keywords}
                onChange={setKeywords}
                placeholder="e.g. pink nails, butterfly, medium..."
                max={10}
              />
            </div>

            {/* Quick fills */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", marginBottom: 6 }}>Quick fill example:</div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setKeywords(EXAMPLE_KEYWORDS)}
                style={{ fontSize: 11 }}
              >
                Use butterfly pink set example
              </button>
            </div>

            {/* Style */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 8 }}>
                Style (optional)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {STYLE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(style === s ? "" : s)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: style === s ? "hsl(var(--brand-primary) / 0.5)" : "hsl(var(--bg-border))",
                      background: style === s ? "hsl(var(--brand-primary) / 0.12)" : "hsl(var(--bg-elevated))",
                      color: style === s ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))",
                      fontSize: 12,
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "hsl(var(--text-secondary))", marginBottom: 8 }}>
                Target Audience (optional)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {AUDIENCE_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAudience(audience === a ? "" : a)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: "1px solid",
                      borderColor: audience === a ? "hsl(var(--brand-secondary) / 0.5)" : "hsl(var(--bg-border))",
                      background: audience === a ? "hsl(var(--brand-secondary) / 0.12)" : "hsl(var(--bg-elevated))",
                      color: audience === a ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))",
                      fontSize: 12,
                      cursor: "pointer",
                      transition: "all 0.12s",
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={generate}
              disabled={keywords.length === 0 || loading}
              style={{ width: "100%", justifyContent: "center", gap: 8 }}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  Generate Listing Content
                </>
              )}
            </button>

            {/* Info note */}
            <div style={{ marginTop: 12, display: "flex", gap: 8, padding: "10px 12px", background: "hsl(var(--brand-secondary) / 0.08)", borderRadius: 8, border: "1px solid hsl(var(--brand-secondary) / 0.2)" }}>
              <Info size={13} color="hsl(var(--brand-secondary))" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 11, color: "hsl(var(--text-muted))", lineHeight: 1.5 }}>
                AI uses Etsy SEO best practices — 140-char title limit, 13 optimized tags, keyword-rich descriptions.
              </div>
            </div>
          </div>
        </div>

        {/* Right — Output Panel */}
        <div>
          {!result && !loading && (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
                border: "2px dashed hsl(var(--bg-border))",
                borderRadius: 12,
                padding: 40,
                minHeight: 400,
              }}
            >
              <div style={{ width: 60, height: 60, borderRadius: 16, background: "hsl(var(--brand-primary) / 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={28} color="hsl(var(--brand-primary))" strokeWidth={1.5} />
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "hsl(var(--text-primary))", marginBottom: 8 }}>
                  Ready to generate
                </div>
                <div style={{ fontSize: 13, color: "hsl(var(--text-muted))", maxWidth: 300, lineHeight: 1.6 }}>
                  Add your product keywords on the left and click Generate to create an SEO-optimized Etsy listing in seconds.
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="glass" style={{ padding: 32, minHeight: 400, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <RefreshCw size={16} color="hsl(var(--brand-primary))" style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--text-primary))" }}>AI is writing your listing...</span>
              </div>
              {[160, 80, 200, 120, 100].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 16, width: w, borderRadius: 6 }} />
              ))}
              <div className="skeleton" style={{ height: 160, width: "100%", borderRadius: 8, marginTop: 8 }} />
            </div>
          )}

          {result && (
            <div className="glass" style={{ overflow: "hidden" }}>
              {/* Tab bar */}
              <div style={{ display: "flex", borderBottom: "1px solid hsl(var(--bg-border))", padding: "0 20px" }}>
                {(["title", "description", "tags"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      fontWeight: activeTab === tab ? 600 : 400,
                      color: activeTab === tab ? "hsl(var(--text-primary))" : "hsl(var(--text-muted))",
                      background: "transparent",
                      border: "none",
                      borderBottom: activeTab === tab ? "2px solid hsl(var(--brand-primary))" : "2px solid transparent",
                      cursor: "pointer",
                      marginBottom: -1,
                      textTransform: "capitalize",
                    }}
                  >
                    {tab === "title" ? "📝 Title" : tab === "description" ? "📄 Description" : "🏷 Tags"}
                  </button>
                ))}

                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={generate}>
                    <RefreshCw size={13} />
                    Regenerate
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <ChevronRight size={13} />
                    Use in Listing
                  </button>
                </div>
              </div>

              <div style={{ padding: "20px 24px" }}>
                {activeTab === "title" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--text-muted))", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Title · {result.title.length}/140 characters
                      </div>
                      <CopyButton text={result.title} />
                    </div>
                    <div
                      style={{
                        padding: "14px 16px",
                        background: "hsl(var(--bg-elevated))",
                        borderRadius: 8,
                        border: "1px solid hsl(var(--bg-border))",
                        fontSize: 15,
                        fontWeight: 600,
                        color: "hsl(var(--text-primary))",
                        lineHeight: 1.5,
                      }}
                    >
                      {result.title}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: result.title.length > 140 ? "hsl(var(--status-error))" : "hsl(var(--status-success))" }}>
                      {result.title.length <= 140 ? "✓ Within Etsy's 140 character limit" : "⚠ Exceeds limit — consider shortening"}
                    </div>
                  </div>
                )}

                {activeTab === "description" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--text-muted))", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Description · {result.description.length} characters
                      </div>
                      <CopyButton text={result.description} />
                    </div>
                    <textarea
                      style={{
                        width: "100%",
                        minHeight: 320,
                        padding: "14px 16px",
                        background: "hsl(var(--bg-elevated))",
                        borderRadius: 8,
                        border: "1px solid hsl(var(--bg-border))",
                        fontSize: 13,
                        color: "hsl(var(--text-primary))",
                        lineHeight: 1.7,
                        fontFamily: "inherit",
                        resize: "vertical",
                        outline: "none",
                      }}
                      defaultValue={result.description}
                    />
                  </div>
                )}

                {activeTab === "tags" && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "hsl(var(--text-muted))", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Tags · {result.tags.length}/13 · Etsy maximum
                      </div>
                      <CopyButton text={result.tags.join(", ")} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                      {result.tags.map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "6px 12px",
                            background: "hsl(var(--brand-primary) / 0.1)",
                            border: "1px solid hsl(var(--brand-primary) / 0.25)",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 500,
                            color: "hsl(var(--text-primary))",
                          }}
                        >
                          <Tag size={11} style={{ marginRight: 6, opacity: 0.6 }} />
                          {tag}
                        </span>
                      ))}
                      {Array.from({ length: 13 - result.tags.length }).map((_, i) => (
                        <span
                          key={`empty-${i}`}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "6px 12px",
                            background: "transparent",
                            border: "1px dashed hsl(var(--bg-border))",
                            borderRadius: 8,
                            fontSize: 13,
                            color: "hsl(var(--text-muted))",
                          }}
                        >
                          + empty slot
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: "hsl(var(--text-muted))" }}>
                      ✓ Each tag is under 20 characters · Optimized for Etsy search
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
