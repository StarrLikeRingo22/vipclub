import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { listBusinesses, createBusiness, createServices } from "@/lib/db";
import { createUser, getUserByEmail } from "@/lib/users";
import { starterServices } from "@/lib/seed";

export const runtime = "nodejs";

// Admin: list all businesses on the platform.
export async function GET() {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;
  const businesses = await listBusinesses();
  return NextResponse.json({
    businesses: businesses.map((b) => ({
      id: b.id, business_name: b.business_name, business_type: b.business_type,
      reward_threshold: b.reward_threshold,
    })),
  });
}

// Admin: create a business + its owner login + a starter service menu.
export async function POST(req: NextRequest) {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const business_name = String(body.business_name ?? "").trim();
  const business_type = String(body.business_type ?? "Salon").trim() || "Salon";
  const owner_name = String(body.owner_name ?? "").trim();
  const owner_email = String(body.owner_email ?? "").trim().toLowerCase();
  const owner_password = String(body.owner_password ?? "");

  if (!business_name || !owner_name || !owner_email || owner_password.length < 6) {
    return NextResponse.json({ error: "Business name, owner name, email and a 6+ character password are required." }, { status: 400 });
  }

  try {
    if (await getUserByEmail(owner_email)) {
      return NextResponse.json({ error: "That owner email is already in use." }, { status: 409 });
    }
    const business = await createBusiness({ business_name, business_type });
    const owner = await createUser({ email: owner_email, password: owner_password, role: "owner", business_id: business.id, name: owner_name });
    await createServices(starterServices(business_type).map((s) => ({ business_id: business.id, ...s })));

    return NextResponse.json({
      business: { id: business.id, business_name: business.business_name, business_type: business.business_type },
      owner: { email: owner.email, name: owner.name },
    }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 503 });
  }
}
