import { buildSizeGuideText, SHOP_DEFAULTS } from "@/lib/shop/defaults";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIListingResult {
  title: string;
  description: string;
  tags: string[];
  style: string;       // e.g. "Gothic", "Floral", "Minimalist"
  colors: string[];    // e.g. ["black", "gold"]
  occasion: string;    // e.g. "Halloween", "Bridal", "Everyday"
  section: string;     // Etsy shop section
}

// ─── The Master AI Prompt ─────────────────────────────────────────────────────

function buildPrompt(): string {
  const sizeGuide = buildSizeGuideText();
  const shapes = SHOP_DEFAULTS.shapeVariant.options.map((s) => s.name).join(", ");

  return `You are an expert Etsy SEO copywriter specializing in handmade press-on nail sets.

You will receive one or more photos of a handmade press-on nail set from the shop "Orra Nails" (India).

Your task is to analyze the nail art in the photos and return a JSON object with the following fields:

{
  "title": "...",       // Etsy listing title — max 140 characters, keyword-rich, SEO-optimized. Include nail style, colors, occasion, and "Press On Nails" or "Press-On Nails". Do NOT use all caps.
  "description": "...", // Full product description (see format below)
  "tags": [...],        // Exactly 13 Etsy tags. Each tag max 20 characters. Include colors, style, nail shape, occasion, material. No spaces (use hyphens). e.g. ["press-on-nails", "nail-art"]
  "style": "...",       // One word/phrase: e.g. "Gothic", "Floral", "Minimalist", "Glam", "Cute", "Boho", "Vintage", "Seasonal"
  "colors": [...],      // Array of 1–4 main colors visible in the design
  "occasion": "...",    // e.g. "Everyday", "Bridal", "Halloween", "Festival", "Office", "Party"
  "section": "..."      // One of: "Press-On Sets", "Custom Sets", "Special Editions", "Gift Sets"
}

DESCRIPTION FORMAT (follow this structure exactly):
---
[2–3 sentences describing what makes this specific nail set special — colors, design details, finish, vibe]

✨ WHAT YOU'LL LOVE
• [Key design feature 1]
• [Key design feature 2]
• [Key design feature 3]
• Handcrafted with premium materials
• Reusable with nail glue (included)
• Salon-quality finish at home

📦 WHAT'S INCLUDED
• 24 press-on nails in assorted sizes (XS to XL)
• Nail glue
• Prep pad + mini file
• Easy application guide

${sizeGuide}

Available Shapes: ${shapes}

${SHOP_DEFAULTS.descriptionTemplate.footer}
---

RULES:
- Title MUST be under 140 characters
- Tags MUST be exactly 13, each under 20 characters
- Description must feel warm, inviting, and premium — not robotic
- Mention the specific colors and design elements you can see in the photos
- Tags should include a mix of: product type, colors, style, occasion, nail shape, keywords buyers search

Return ONLY the JSON object — no extra text, no markdown code blocks, no explanation.`;
}

// ─── API Route Handler ────────────────────────────────────────────────────────

export const LISTING_GENERATION_PROMPT = buildPrompt();

/** Parse and validate AI response JSON */
export function parseAIResponse(raw: string): AIListingResult {
  // Strip any accidental markdown code fences
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);

  // Validate required fields
  if (!parsed.title || !parsed.description || !Array.isArray(parsed.tags)) {
    throw new Error("AI response missing required fields");
  }

  // Enforce limits
  if (parsed.title.length > 140) {
    parsed.title = parsed.title.slice(0, 137) + "...";
  }
  if (parsed.tags.length > 13) {
    parsed.tags = parsed.tags.slice(0, 13);
  }
  parsed.tags = parsed.tags.map((t: string) =>
    t.toLowerCase().replace(/\s+/g, "-").slice(0, 20)
  );

  return parsed as AIListingResult;
}

/** Demo/mock result used when no API key is configured */
export function getMockAIResult(): AIListingResult {
  return {
    title:
      "Handmade Gothic Black Press On Nails | Stiletto Nail Art Set | Halloween Nails | Dark Academia",
    description: `Embrace your dark side with these stunning Gothic black press-on nails featuring intricate gold filigree detailing. Perfect for Halloween, gothic events, or anyone who loves a dramatic, editorial nail look. Each set is handcrafted with care using premium materials for a salon-quality finish.

✨ WHAT YOU'LL LOVE
• Dramatic black base with hand-painted gold filigree
• Ultra-pointed stiletto shape for maximum drama
• Long-lasting gel-like finish — no chipping
• Handcrafted with premium materials
• Reusable with nail glue (included)
• Salon-quality finish at home

📦 WHAT'S INCLUDED
• 24 press-on nails in assorted sizes (XS to XL)
• Nail glue
• Prep pad + mini file
• Easy application guide

${buildSizeGuideText()}

Available Shapes: Stiletto, Square, Soft Square, Oval, Coffin / Ballerina, Almond

${SHOP_DEFAULTS.descriptionTemplate.footer}`,
    tags: [
      "press-on-nails",
      "gothic-nails",
      "black-nails",
      "halloween-nails",
      "stiletto-nails",
      "nail-art",
      "dark-nails",
      "handmade-nails",
      "custom-nails",
      "fake-nails",
      "nail-set",
      "gift-for-her",
      "gold-nails",
    ],
    style: "Gothic",
    colors: ["black", "gold"],
    occasion: "Halloween",
    section: "Special Editions",
  };
}
