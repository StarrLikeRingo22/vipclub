import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { updateCustomer } from "@/lib/clients";

export const runtime = "nodejs";

// Owner/staff client management: edit notes, status, SMS consent.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(["owner", "staff"]);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: { notes?: string; status?: "active" | "inactive" | "unsubscribed"; consent_sms?: boolean } = {};
  if (typeof body.notes === "string") patch.notes = body.notes;
  if (body.status === "active" || body.status === "inactive" || body.status === "unsubscribed") {
    patch.status = body.status;
  }
  if (typeof body.consent_sms === "boolean") patch.consent_sms = body.consent_sms;

  const customer = await updateCustomer(params.id, patch);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ customer });
}
