import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/etsy/auth";
import prisma from "@/lib/db";

// GET /api/etsy/shops — returns all shops connected by the current platform user
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ shops: [] });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const shops = await prisma.shop.findMany({
      where:   { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      activeShopId: user?.activeShopId ?? null,
      shops: shops.map(s => ({
        id:          s.id,
        shopName:    s.shopName,
        shopUrl:     s.shopUrl,
        iconUrl:     s.iconUrl,
        currency:    s.currency,
        tokenExpiry: s.tokenExpiry,
        isActive:    s.id === user?.activeShopId,
      })),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
