/**
 * Shop Defaults — single source of truth for all auto-applied listing settings.
 * Edit these values in Settings → Shop Defaults. Changes apply to all future listings.
 */

export const SHOP_DEFAULTS = {
  // ─── Pricing (INR) ────────────────────────────────────────────────────────
  pricing: {
    currency: "INR" as const,
    regions: {
      india: 3450,   // ₹3,450
      us: 3936,   // ₹3,936 (converted by Etsy to USD at checkout)
      everywhere: 3450,   // ₹3,450
    },
  },

  // ─── Inventory ────────────────────────────────────────────────────────────
  quantity: 10,

  // ─── Variant 1: Size ──────────────────────────────────────────────────────
  sizeVariant: {
    name: "Size",
    options: [
      {
        name: "XS",
        enabled: true,
        // nail width measurements in mm: [thumb, index, middle, ring, pinky]
        measurements: { thumb: 14, index: 10, middle: 11, ring: 10, pinky: 8 },
      },
      {
        name: "S",
        enabled: true,
        measurements: { thumb: 15, index: 11, middle: 12, ring: 11, pinky: 9 },
      },
      {
        name: "M",
        enabled: true,
        measurements: { thumb: 16, index: 12, middle: 13, ring: 12, pinky: 10 },
      },
      {
        name: "L",
        enabled: true,
        measurements: { thumb: 17, index: 13, middle: 14, ring: 13, pinky: 11 },
      },
      {
        name: "XL",
        enabled: true,
        measurements: { thumb: 18, index: 14, middle: 15, ring: 14, pinky: 12 },
      },
      {
        name: "Custom Size",
        enabled: true,
        measurements: null, // no fixed measurements — buyer provides
      },
    ],
  },

  // ─── Variant 2: Shape ─────────────────────────────────────────────────────
  shapeVariant: {
    name: "Shape",
    options: [
      { name: "Stiletto", enabled: true },
      { name: "Square", enabled: true },
      { name: "Soft Square", enabled: true },
      { name: "Oval", enabled: true },
      { name: "Coffin / Ballerina", enabled: true },
      { name: "Almond", enabled: true },
    ],
  },

  // ─── Personalization (Custom Size request field) ──────────────────────────
  personalization: {
    enabled: true,
    title: "Custom Size?",
    description:
      "Send 10 nail measurements (L/R) using our photo guide. Please add your phone number for shipping only. Thank You - Orra",
    isRequired: false,
  },

  // ─── Shop Info ────────────────────────────────────────────────────────────
  shop: {
    name: "Orra Nails",
    tagline: "Handcrafted press-on nails made with love 💅",
    origin: "India",
    processingTimeDays: 3,
  },

  // ─── Description Template ─────────────────────────────────────────────────
  // Sections auto-injected into every AI-generated description
  descriptionTemplate: {
    // Injected AFTER the AI-generated product intro
    sizeGuideTitle: "📏 Size Guide — Nail Width in mm",
    // Injected at the END of every description
    footer: `✨ All nails are handcrafted and may have slight variations — that's what makes them unique!

📦 SHIPPING
• India: 3–5 business days
• International: 7–15 business days

🔄 CARE INSTRUCTIONS
• Clean nails before applying
• Use included glue for best results
• Lasts 1–2 weeks with proper care
• Soak in warm water to remove gently

💬 CUSTOM SIZE?
Order "Custom Size" and send us your 10 nail measurements using our photo guide. Add your phone number for shipping coordination.

Thank You - Orra 💕`,
  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the formatted size guide table string to inject into descriptions */
export function buildSizeGuideText(): string {
  const sizes = SHOP_DEFAULTS.sizeVariant.options.filter(
    (o) => o.enabled && o.measurements
  );

  const header = `| Size | Thumb | Index | Middle | Ring | Pinky |
|------|-------|-------|--------|------|-------|`;

  const rows = sizes.map((s) => {
    const m = s.measurements!;
    return `| ${s.name.padEnd(4)} | ${m.thumb}mm   | ${m.index}mm    | ${m.middle}mm     | ${m.ring}mm   | ${m.pinky}mm    |`;
  });

  return `${header}\n${rows.join("\n")}`;
}

/** Returns enabled size names for Etsy listing inventory */
export function getEnabledSizes(): string[] {
  return SHOP_DEFAULTS.sizeVariant.options
    .filter((o) => o.enabled)
    .map((o) => o.name);
}

/** Returns enabled shape names */
export function getEnabledShapes(): string[] {
  return SHOP_DEFAULTS.shapeVariant.options
    .filter((o) => o.enabled)
    .map((o) => o.name);
}

/** Returns the standard price in INR paise (Etsy uses smallest unit) */
export function getPriceInPaise(region: "india" | "us" | "everywhere"): number {
  return SHOP_DEFAULTS.pricing.regions[region] * 100; // INR paise
}
