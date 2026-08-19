import { etsy, getShopId } from "./client";
import { SHOP_DEFAULTS } from "@/lib/shop/defaults";

// ─── Etsy Listing Types ────────────────────────────────────────────────────────

export interface EtsyListing {
  listing_id:          number;
  title:               string;
  description:         string;
  state:               "active" | "draft" | "inactive" | "expired" | "sold_out";
  price:               { amount: number; divisor: number; currency_code: string };
  quantity:            number;
  tags:                string[];
  views:               number;
  num_favorers:        number;
  url:                 string;
  images?:             EtsyListingImage[];
  creation_timestamp:  number;
  last_modified_timestamp: number;
  taxonomy_id?:        number;
  shop_section_id?:    number;
  shipping_profile_id?: number;
}

export interface EtsyListingImage {
  listing_image_id: number;
  listing_id:       number;
  url_fullxfull:    string;
  url_570xN:        string;
  rank:             number;
}

export interface EtsyListingsResponse {
  count:   number;
  results: EtsyListing[];
}

// ─── Get all shop listings ─────────────────────────────────────────────────────

export async function getShopListings(
  state: "active" | "draft" | "inactive" | "all" = "all",
  limit = 100,
  offset = 0
): Promise<EtsyListingsResponse> {
  const shopId = await getShopId();
  const params = new URLSearchParams({
    limit:          String(limit),
    offset:         String(offset),
    includes:       "Images",
  });
  if (state !== "all") params.set("state", state);

  return etsy.get<EtsyListingsResponse>(
    `/application/shops/${shopId}/listings?${params}`
  );
}

// ─── Get single listing ────────────────────────────────────────────────────────

export async function getListing(listingId: string): Promise<EtsyListing> {
  return etsy.get<EtsyListing>(
    `/application/listings/${listingId}?includes=Images`
  );
}

// ─── Create listing draft ──────────────────────────────────────────────────────

export interface CreateListingPayload {
  title:       string;
  description: string;
  price:       number;        // in shop currency (INR)
  quantity:    number;
  tags:        string[];      // max 13, max 20 chars each
  state?:      "draft" | "active";
  taxonomyId?: number;
  shippingProfileId?: number;
}

export async function createListing(
  payload: CreateListingPayload
): Promise<EtsyListing> {
  const shopId = await getShopId();

  return etsy.post<EtsyListing>(
    `/application/shops/${shopId}/listings`,
    {
      title:              payload.title.slice(0, 140),
      description:        payload.description,
      price:              payload.price,
      quantity:           payload.quantity ?? SHOP_DEFAULTS.quantity,
      tags:               payload.tags.slice(0, 13),
      who_made:           "i_did",
      when_made:          "made_to_order",
      taxonomy_id:        payload.taxonomyId ?? 2078,  // Accessories > Nail Art
      is_supply:          false,
      state:              payload.state ?? "draft",
      shipping_profile_id: payload.shippingProfileId,
    }
  );
}

// ─── Update listing ────────────────────────────────────────────────────────────

export async function updateListing(
  listingId: string,
  fields: Partial<CreateListingPayload>
): Promise<EtsyListing> {
  const shopId = await getShopId();
  const body: Record<string, unknown> = {};
  if (fields.title)       body.title       = fields.title.slice(0, 140);
  if (fields.description) body.description = fields.description;
  if (fields.price)       body.price       = fields.price;
  if (fields.quantity)    body.quantity    = fields.quantity;
  if (fields.tags)        body.tags        = fields.tags.slice(0, 13);
  if (fields.state)       body.state       = fields.state;

  return etsy.patch<EtsyListing>(
    `/application/shops/${shopId}/listings/${listingId}`,
    body
  );
}

// ─── Delete listing ────────────────────────────────────────────────────────────

export async function deleteListing(listingId: string): Promise<void> {
  const shopId = await getShopId();
  await etsy.delete(`/application/shops/${shopId}/listings/${listingId}`);
}

// ─── Upload listing image ──────────────────────────────────────────────────────

export async function uploadListingImage(
  listingId: string,
  imageBuffer: Buffer,
  mimeType: string,
  rank: number
): Promise<EtsyListingImage> {
  const shopId = await getShopId();

  // Etsy requires multipart/form-data for image uploads — use FormData
  const { getActiveShop } = await import("./auth");
  const shop = await getActiveShop();
  if (!shop) throw new Error("No connected shop");

  const form = new FormData();
  form.append("rank", String(rank));
  form.append(
    "image",
    new Blob([new Uint8Array(imageBuffer)], { type: mimeType }),
    `photo_${rank}.jpg`
  );

  const res = await fetch(
    `https://openapi.etsy.com/v3/application/shops/${shopId}/listings/${listingId}/images`,
    {
      method:  "POST",
      headers: {
        "x-api-key":    process.env.ETSY_API_KEY!,
        Authorization:  `Bearer ${shop.accessToken}`,
        // Don't set Content-Type — browser/node sets it with boundary for FormData
      },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(`Image upload failed ${res.status}: ${JSON.stringify(err)}`);
  }
  return res.json();
}

// ─── Set listing inventory (variations) ───────────────────────────────────────

export async function setListingInventory(listingId: string): Promise<void> {
  const sizes  = SHOP_DEFAULTS.sizeVariant.options.filter((o) => o.enabled).map((o) => o.name);
  const shapes = SHOP_DEFAULTS.shapeVariant.options.filter((o) => o.enabled).map((o) => o.name);
  const price  = SHOP_DEFAULTS.pricing.regions.india;

  // Build cross-product of sizes × shapes
  const products = sizes.flatMap((size) =>
    shapes.map((shape) => ({
      sku:           `ORRA-${size}-${shape.replace(/\s+/g, "-").toUpperCase()}`,
      property_values: [
        { property_id: 200, property_name: "Size",  values: [size]  },
        { property_id: 52,  property_name: "Shape", values: [shape] },
      ],
      offerings: [
        {
          price:      price,
          quantity:   SHOP_DEFAULTS.quantity,
          is_enabled: true,
        },
      ],
    }))
  );

  await etsy.put(`/application/listings/${listingId}/inventory`, {
    products,
    price_on_property:    [200],  // price varies by Size property
    quantity_on_property: [],
    sku_on_property:      [],
  });
}
