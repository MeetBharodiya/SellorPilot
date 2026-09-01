import { NextRequest, NextResponse } from "next/server";
import { getActiveShop, getCurrentUserId } from "@/lib/etsy/auth";
import prisma from "@/lib/db";

// GET /api/etsy/shop — returns the currently active shop info
export async function GET() {
  try {
    const shop = await getActiveShop();
    if (!shop) return NextResponse.json({ connected: false });

    return NextResponse.json({
      connected:   true,
      id:          shop.id,          // exposed for shop switching
      shopName:    shop.shopName,
      shopUrl:     shop.shopUrl,
      iconUrl:     shop.iconUrl,
      currency:    shop.currency,
      tokenExpiry: shop.tokenExpiry,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ connected: false, error: msg }, { status: 500 });
  }
}

// PATCH /api/etsy/shop — switch active shop
// Body: { shopId: string }
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Not identified" }, { status: 401 });

    const { shopId } = await req.json();
    if (!shopId) return NextResponse.json({ error: "shopId required" }, { status: 400 });

    // Verify the shop belongs to this user
    const shop = await prisma.shop.findFirst({ where: { id: shopId, userId } });
    if (!shop) return NextResponse.json({ error: "Shop not found" }, { status: 404 });

    // Update active shop pointer
    await prisma.user.update({
      where: { id: userId },
      data:  { activeShopId: shopId },
    });

    return NextResponse.json({
      connected:   true,
      id:          shop.id,
      shopName:    shop.shopName,
      shopUrl:     shop.shopUrl,
      iconUrl:     shop.iconUrl,
      currency:    shop.currency,
      tokenExpiry: shop.tokenExpiry,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/etsy/shop — disconnect/remove a shop
// Body: { shopId?: string } — if omitted, removes the currently active shop
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Not identified" }, { status: 401 });

    // Allow deleting a specific shop or the active one
    let shopId: string | undefined;
    try {
      const body = await req.json();
      shopId = body?.shopId;
    } catch {
      // No body — fall through to active shop
    }

    const shop = shopId
      ? await prisma.shop.findFirst({ where: { id: shopId, userId } })
      : await getActiveShop();

    if (!shop) return NextResponse.json({ success: true }); // Already gone

    // Delete the shop
    await prisma.shop.delete({ where: { id: shop.id } });

    // If this was the active shop, point to the next available shop
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.activeShopId === shop.id) {
      const nextShop = await prisma.shop.findFirst({ where: { userId } });
      await prisma.user.update({
        where: { id: userId },
        data:  { activeShopId: nextShop?.id ?? null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
