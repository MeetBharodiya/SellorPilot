/**
 * Builds the saree listing prompt.
 * Description is REQUIRED — it carries fabric, length, blouse, and care info
 * that cannot be reliably extracted from photos alone.
 * Photos are used for: colors, design patterns, aesthetic, drape style.
 */
export function buildSareePrompt(sellerDescription: string): string {
  return `You are an expert Etsy SEO copywriter specializing in Indian ethnic wear, handloom sarees, and traditional textiles.

You will receive:
1. One or more product photos of a saree
2. A product description written by the seller (primary source of facts)

SELLER'S PRODUCT DESCRIPTION:
"${sellerDescription.trim()}"

YOUR TASK:
- Use the seller's description as the authoritative source for: fabric type, length, blouse details (stitched/unstitched + measurement), care instructions, and weave/origin details.
- Use the photos to identify: colors, design patterns, border style, motifs, drape aesthetic, and overall vibe.
- IMPORTANT COLOR RULE: If colors are not explicitly mentioned in the description, extract them from the photos. If mentioned in both, description takes priority.
- Combine both to write a compelling, accurate Etsy listing that a buyer would trust.

Return a JSON object with exactly these fields:

{
  "title": "...",       // Max 140 chars. Include: fabric, key design feature, occasion, "Saree". e.g. "Banarasi Silk Saree | Zari Border | Wedding Saree | Traditional Indian | Unstitched Blouse"
  "description": "...", // Full product description — follow the format below exactly
  "tags": [...],        // Exactly 13 Etsy tags. Each max 20 chars. Focus on: fabric, weave, occasion, region, style. e.g. ["banarasi-saree", "silk-saree", "wedding-saree"]
  "style": "...",       // One of: "Traditional", "Contemporary", "Bridal", "Festive", "Casual", "Designer"
  "colors": [...],      // 1–4 main colors. Extract from photos if not in description.
  "occasion": "...",    // e.g. "Wedding", "Festival", "Casual", "Party", "Office"
  "section": "..."      // One of: "Silk Sarees", "Cotton Sarees", "Designer Sarees", "Bridal Sarees"
}

DESCRIPTION FORMAT (follow this structure exactly):
---
[2–3 sentences about the saree's beauty, fabric quality, craftsmanship, and the occasion it's perfect for. Make it evocative and premium.]

🧵 FABRIC & DETAILS
• Fabric: [from seller description]
• Length: [from seller description — e.g. 5.5 metres]
• Blouse: [from seller description — e.g. Unstitched, 0.85 metre included / Stitched, ready to wear]
• Care: [from seller description — e.g. Dry clean only / Hand wash in cold water]
• Origin: [if mentioned in description or identifiable from photos]

✨ WHY YOU'LL LOVE IT
• [Distinctive design feature visible in photos — e.g. hand-woven zari border, floral motifs, temple design]
• [Occasion fit — e.g. Perfect for weddings, festivals, and celebratory gatherings]
• Authentic craftsmanship — made by skilled artisans
• Vibrant colors that photograph beautifully
• Ships from India with careful, damage-free packaging

📦 WHAT'S INCLUDED
• 1 Saree ([length] metres)
[• 1 Unstitched blouse piece ([measurement] metres) — only if mentioned in description]

💬 CUSTOM ORDERS
Looking for a specific color or design? We also take custom orders — message us before purchasing.

📦 SHIPPING
• India: 3–5 business days
• International: 7–14 business days
---

RULES:
- Title MUST be under 140 characters
- Tags MUST be EXACTLY 13 items. Do not generate 12, do not generate 14. Count them carefully to ensure there are exactly 13 tags, each under 20 characters.
- Base the description heavily on the provided SELLER'S DESCRIPTION
- Mention the specific colors, patterns, and drape styles you can see in the photos
- Tags should include a mix of: fabric, style, occasion, color, traditional keywords

Return ONLY the JSON object — no extra text, no markdown code blocks, no explanation.`;
}
