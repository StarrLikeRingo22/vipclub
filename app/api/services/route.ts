import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { createService } from "@/lib/db";

export const runtime = "nodejs";

// Owner: add a service to their business menu.
export async function POST(req: NextRequest) {
  const auth = await requireRole(["owner"]);
  if ("error" in auth) return auth.error;
  const businessId = auth.session.businessId;
  if (!businessId) return NextResponse.json({ error: "No business on account" }, { status: 400 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const category = String(body.category ?? "Other").trim() || "Other";
  const name = String(body.name ?? "").trim();
  const price = Number(body.price ?? 0) || 0;
  const duration_min = Number(body.duration_min ?? 30) || 30;
  if (!name) return NextResponse.json({ error: "Service name is required." }, { status: 400 });

  try {
    const service = await createService({ business_id: businessId, category, name, price, duration_min });
    return NextResponse.json({ service }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 503 });
  }
}
