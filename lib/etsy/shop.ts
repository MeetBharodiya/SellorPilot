import { etsy } from "./client";
import { getActiveShop } from "./auth";
import { prisma } from "@/lib/db";

export interface EtsyShop {
  shop_id:        number;
  shop_name:      string;
  title:          string;
  currency_code:  string;
  listing_active_count: number;
  login_name:     string;
  icon_url_fullxfull?: string;
  url:            string;
}

export interface EtsyUserProfile {
  user_id:   number;
  login_name: string;
  email:     string;
  primary_email: string;
}

// ─── Get authenticated user's profile ─────────────────────────────────────────

export async function getMe(): Promise<EtsyUserProfile> {
  return etsy.get<EtsyUserProfile>("/application/users/me");
}

// ─── Get shop info by ID ───────────────────────────────────────────────────────

export async function getShop(shopId: string): Promise<EtsyShop> {
  return etsy.get<EtsyShop>(`/application/shops/${shopId}`);
}

// ─── Get shop for authenticated user ──────────────────────────────────────────

export async function getMyShop(): Promise<EtsyShop | null> {
  const shop = await getActiveShop();
  if (!shop) return null;
  return getShop(shop.etsyShopId);
}

// ─── Save shop info to DB after OAuth connect ─────────────────────────────────

export async function saveShopToDB(
  etsyShop: EtsyShop,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<void> {
  // For personal tool: upsert — there's only ever one shop
  await prisma.shop.upsert({
    where:  { etsyShopId: String(etsyShop.shop_id) },
    update: {
      shopName:     etsyShop.shop_name,
      shopUrl:      etsyShop.url,
      iconUrl:      etsyShop.icon_url_fullxfull,
      accessToken,
      refreshToken,
      tokenExpiry:  new Date(Date.now() + expiresIn * 1000),
      currency:     etsyShop.currency_code,
      isActive:     true,
    },
    create: {
      etsyShopId:   String(etsyShop.shop_id),
      shopName:     etsyShop.shop_name,
      shopUrl:      etsyShop.url,
      iconUrl:      etsyShop.icon_url_fullxfull,
      accessToken,
      refreshToken,
      tokenExpiry:  new Date(Date.now() + expiresIn * 1000),
      currency:     etsyShop.currency_code,
      isActive:     true,
      // Personal tool: create a default user if none exists
      user: {
        connectOrCreate: {
          where:  { email: "owner@orra-nails.local" },
          create: {
            email: "owner@orra-nails.local",
            name:  etsyShop.shop_name,
          },
        },
      },
    },
  });
}
