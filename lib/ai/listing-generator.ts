import { buildSizeGuideText, SHOP_DEFAULTS } from "@/lib/shop/defaults";
import { getPromptForCategory } from "@/lib/ai/prompts/index";

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

// ─── Prompt builder (delegates to category-specific prompt files) ─────────────

/**
 * Returns the correct Gemini prompt for the given category and optional seller description.
 * Use this in the generate-listing route instead of the old LISTING_GENERATION_PROMPT constant.
 */
export { getPromptForCategory };

/**
 * @deprecated Use getPromptForCategory("press_on_nails") instead.
 * Kept for backward compatibility — defaults to nails prompt.
 */
export const LISTING_GENERATION_PROMPT = getPromptForCategory("press_on_nails");

// ─── Parse + validate AI response ────────────────────────────────────────────

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
