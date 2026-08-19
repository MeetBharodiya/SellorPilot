import { NextRequest, NextResponse } from "next/server";
import { getListing, updateListing, deleteListing } from "@/lib/etsy/listings";

// GET /api/etsy/listings/[id]
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const listing = await getListing(id);
    return NextResponse.json(listing);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}

// PATCH /api/etsy/listings/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body    = await req.json();
    const listing = await updateListing(id, body);
    return NextResponse.json(listing);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}

// DELETE /api/etsy/listings/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteListing(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status ?? 500 });
  }
}
