import { NextResponse } from "next/server";
import { getActiveShop } from "@/lib/etsy/auth";
import { getMyShop } from "@/lib/etsy/shop";

// GET /api/etsy/shop — returns connected shop info or null
export async function GET() {
  try {
    const shop = await getActiveShop();
    if (!shop) return NextResponse.json({ connected: false });

    // Return DB shop info (no need to hit Etsy API just for status check)
    return NextResponse.json({
      connected:   true,
      shopName:    shop.shopName,
      shopUrl:     shop.shopUrl,
      iconUrl:     shop.iconUrl,
      currency:    shop.currency,
      tokenExpiry: shop.tokenExpiry,
    });
  } catch (err: any) {
    return NextResponse.json({ connected: false, error: err.message }, { status: 500 });
  }
}
