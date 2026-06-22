import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { listStaff, createUser, getUserByEmail } from "@/lib/users";

export const runtime = "nodejs";

// List staff for the signed-in owner's business.
export async function GET() {
  const auth = await requireRole(["owner"]);
  if ("error" in auth) return auth.error;
  const businessId = auth.session.businessId;
  if (!businessId) return NextResponse.json({ staff: [] });
  const staff = await listStaff(businessId);
  return NextResponse.json({
    staff: staff.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
  });
}

// Owner invites a staff member (email + password, hashed).
export async function POST(req: NextRequest) {
  const auth = await requireRole(["owner"]);
  if ("error" in auth) return auth.error;
  const businessId = auth.session.businessId;
  if (!businessId) return NextResponse.json({ error: "No business on account" }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = body.role === "owner" ? "owner" : "staff";

  if (!name || !email || password.length < 6) {
    return NextResponse.json({ error: "Name, email and a 6+ char password are required." }, { status: 400 });
  }
  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
  }

  try {
    const user = await createUser({ email, password, role, business_id: businessId, name });
    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 503 });
  }
}
