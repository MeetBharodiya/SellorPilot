/**
 * Category Configuration — single source of truth for all product categories.
 * Controls: UI form fields, LLM prompt selection, Etsy taxonomy, variant behaviour.
 *
 * To add a new category: add an entry to CATEGORIES and create a matching prompt file.
 */

export type CategoryKey = "press_on_nails" | "sarees" | "jewellery";

export interface CategoryConfig {
  key:                   CategoryKey;
  label:                 string;      // Display name in dropdowns
  etsyTaxonomyId:        number;      // Etsy taxonomy ID for this product type
  requiresDescription:   boolean;     // If true, description textarea is required in UI
  descriptionLabel:      string;      // Label shown above the textarea
  descriptionPlaceholder: string;     // Hint text inside the textarea
  skipInventoryVariants: boolean;     // Skip size×shape variants (true for sarees, jewellery)
  sectionOptions:        string[];    // Valid Etsy shop section names for this category
  defaultPrice:          number;      // Default listing price in INR
  icon:                  string;      // Emoji icon for UI display
}

export const CATEGORIES: Record<CategoryKey, CategoryConfig> = {
  press_on_nails: {
    key:                   "press_on_nails",
    label:                 "Press-On Nails",
    etsyTaxonomyId:        2078,        // Accessories > Nail Art
    requiresDescription:   false,
    descriptionLabel:      "Add context for AI (optional)",
    descriptionPlaceholder: "e.g. This is a bridal set with gold foiling, coffin shape, meant for weddings...",
    skipInventoryVariants: false,       // Nails use size × shape variants
    sectionOptions:        ["Press-On Sets", "Custom Sets", "Special Editions", "Gift Sets"],
    defaultPrice:          3450,
    icon:                  "💅",
  },

  sarees: {
    key:                   "sarees",
    label:                 "Sarees",
    etsyTaxonomyId:        1249,        // Clothing > Traditional Wear > Sarees
    requiresDescription:   true,        // Fabric, length, blouse cannot be seen from photos
    descriptionLabel:      "Product Description (required)",
    descriptionPlaceholder: "e.g. Pure Banarasi silk saree, zari border, 5.5m length, unstitched blouse 0.85m included, dry clean only, suitable for weddings and festivals",
    skipInventoryVariants: true,        // Sarees are listed individually, no size/shape variants
    sectionOptions:        ["Silk Sarees", "Cotton Sarees", "Designer Sarees", "Bridal Sarees"],
    defaultPrice:          2500,
    icon:                  "🥻",
  },

  jewellery: {
    key:                   "jewellery",
    label:                 "Jewellery",
    etsyTaxonomyId:        1234,        // Jewellery > Necklaces (adjust per listing)
    requiresDescription:   false,
    descriptionLabel:      "Add details (optional)",
    descriptionPlaceholder: "e.g. 925 sterling silver, amethyst stone pendant, 18 inch chain included",
    skipInventoryVariants: true,
    sectionOptions:        ["Necklaces", "Earrings", "Rings", "Bracelets", "Sets"],
    defaultPrice:          1200,
    icon:                  "💍",
  },
};

/** Get a category config by key, falling back to press_on_nails */
export function getCategoryConfig(key?: string | null): CategoryConfig {
  return CATEGORIES[(key as CategoryKey) ?? "press_on_nails"] ?? CATEGORIES.press_on_nails;
}

export const DEFAULT_CATEGORY: CategoryKey = "press_on_nails";

/** All categories as an array — for rendering dropdowns */
export const CATEGORY_LIST: CategoryConfig[] = Object.values(CATEGORIES);
