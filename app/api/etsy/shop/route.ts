import { NextResponse } from "next/server";
import { getActiveShop } from "@/lib/etsy/auth";
import prisma from "@/lib/db";

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

// DELETE /api/etsy/shop — disconnect shop
export async function DELETE() {
  try {
    const shop = await getActiveShop();
    if (!shop) return NextResponse.json({ success: true });

    await prisma.shop.delete({
      where: { id: shop.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
