import { NextRequest, NextResponse } from "next/server";
import { getShopOrders, updateOrderTracking } from "@/lib/etsy/orders";
import { getActiveShop } from "@/lib/etsy/auth";

// GET /api/etsy/orders
export async function GET(req: NextRequest) {
  try {
    const shop = await getActiveShop();
    if (!shop) {
      return NextResponse.json({ error: "no_shop", message: "No Etsy shop connected." }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status") as any;
    const limit  = parseInt(searchParams.get("limit")  ?? "100");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const data = await getShopOrders(status, limit, offset);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/etsy/orders]", err);
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}

// POST /api/etsy/orders — update tracking
export async function POST(req: NextRequest) {
  try {
    const { receiptId, trackingCode, carrierName } = await req.json();
    await updateOrderTracking(receiptId, trackingCode, carrierName);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST /api/etsy/orders tracking]", err);
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}
