import { NextRequest, NextResponse } from "next/server";
import { getShopListings, createListing } from "@/lib/etsy/listings";
import { getActiveShop } from "@/lib/etsy/auth";

// GET /api/etsy/listings — fetch all listings from Etsy
export async function GET(req: NextRequest) {
  try {
    const shop = await getActiveShop();
    if (!shop) {
      return NextResponse.json({ error: "no_shop", message: "No Etsy shop connected. Go to Settings." }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const state  = (searchParams.get("state") as any) ?? "all";
    const limit  = parseInt(searchParams.get("limit")  ?? "100");
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const data = await getShopListings(state, limit, offset);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[GET /api/etsy/listings]", err);
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}

// POST /api/etsy/listings — create a new listing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const listing = await createListing(body);
    return NextResponse.json(listing, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/etsy/listings]", err);
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}
