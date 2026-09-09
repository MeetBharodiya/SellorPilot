import { buildSizeGuideText, SHOP_DEFAULTS } from "@/lib/shop/defaults";

/**
 * Builds the press-on nails listing prompt.
 * Optionally injects seller's context description for richer AI output.
 */
export function buildNailsPrompt(sellerDescription?: string): string {
  const sizeGuide = buildSizeGuideText();
  const shapes    = SHOP_DEFAULTS.shapeVariant.options.map((s) => s.name).join(", ");

  const contextSection = sellerDescription?.trim()
    ? `\nSELLER'S ADDITIONAL CONTEXT:\n"${sellerDescription.trim()}"\nUse this context to enrich the listing — but always verify details against what you can see in the photos.\n`
    : "";

  return `You are an expert Etsy SEO copywriter specializing in handmade press-on nail sets.

You will receive one or more photos of a handmade press-on nail set.
${contextSection}
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
- Tags MUST be EXACTLY 13 items. Do not generate 12, do not generate 14. Count them carefully to ensure there are exactly 13 tags, each under 20 characters.
- Description must feel warm, inviting, and premium — not robotic
- Mention the specific colors and design elements you can see in the photos
- Tags should include a mix of: product type, colors, style, occasion, nail shape, keywords buyers search

Return ONLY the JSON object — no extra text, no markdown code blocks, no explanation.`;
}
