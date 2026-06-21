import { NextRequest, NextResponse } from "next/server";
import { completeBooking, getBusiness, recordMessage } from "@/lib/db";
import { sendSms, rewardReadyMessage } from "@/lib/sms";
import { requireRole } from "@/lib/session";

export const runtime = "nodejs";

// Owner taps "Done" on a booking → confirm service → log visit.
export async function POST(
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

  const serviceId = String(body.service_id ?? "");
  if (!serviceId) {
    return NextResponse.json({ error: "service_id required" }, { status: 400 });
  }

  try {
    const result = await completeBooking(params.id, serviceId);
    const visit = result.visit;
    if (visit?.rewardJustEarned && visit.customer.consent_sms) {
      const business = await getBusiness(visit.customer.business_id);
      const text = rewardReadyMessage(
        visit.customer.full_name,
        business?.business_name ?? "your salon",
      );
      const res = await sendSms(visit.customer.phone, text);
      await recordMessage(
        visit.customer.business_id, visit.customer.id,
        "reward_ready", text, res.status, res.sid,
      );
    }
    return NextResponse.json(result);
  } catch (e) {
    const error = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error }, { status: 400 });
  }
}
