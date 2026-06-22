import { NextRequest, NextResponse } from "next/server";
import { addVisit, getCustomer, getBusiness, recordMessage } from "@/lib/db";
import { sendSms, rewardReadyMessage } from "@/lib/sms";
import { requireRole } from "@/lib/session";

export const runtime = "nodejs";

// Staff check-in: log a visit for a customer (scanned QR → Add Visit).
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(["owner", "staff"]);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* allow empty body */
  }

  const serviceName = String(body.service_name ?? "Visit");
  const amount = Number(body.amount ?? 0) || 0;

  const existing = await getCustomer(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  const result = await addVisit(params.id, serviceName, amount);

  if (result.rewardJustEarned && result.customer.consent_sms) {
    const business = await getBusiness(result.customer.business_id);
    const text = rewardReadyMessage(
      result.customer.full_name,
      business?.business_name ?? "your salon",
    );
    const res = await sendSms(result.customer.phone, text);
    await recordMessage(
      result.customer.business_id, result.customer.id,
      "reward_ready", text, res.status, res.sid,
    );
  }

  return NextResponse.json(result);
}
