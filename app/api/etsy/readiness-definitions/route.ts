import { NextResponse } from "next/server";
import { getReadinessStateDefinitions, getOrCreateReadinessStateId } from "@/lib/etsy/listings";

export async function GET() {
  try {
    let definitions = await getReadinessStateDefinitions();
    if (definitions.length === 0) {
      await getOrCreateReadinessStateId();
      definitions = await getReadinessStateDefinitions();
    }
    return NextResponse.json({ results: definitions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
