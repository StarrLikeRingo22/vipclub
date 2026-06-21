import { NextRequest, NextResponse } from "next/server";
import {
  audienceFor, createCampaign, recordMessage, getBusiness,
} from "@/lib/db";
import { sendSms } from "@/lib/sms";
import { requireRole } from "@/lib/session";

export const runtime = "nodejs";

// Owner sends a campaign / periodic message to an audience segment.
export async function POST(req: NextRequest) {
  const auth = await requireRole(["owner"]);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const business_id = String(body.business_id ?? "");
  const audience = String(body.audience ?? "all");
  const message = String(body.message ?? "").trim();

  if (!business_id || !message) {
    return NextResponse.json({ error: "business_id and message required" }, { status: 400 });
  }

  const business = await getBusiness(business_id);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const recipients = await audienceFor(business_id, audience);

  let sent = 0;
  let failed = 0;
  for (const c of recipients) {
    const res = await sendSms(c.phone, message);
    await recordMessage(business_id, c.id, "campaign", message, res.status, res.sid);
    if (res.ok) sent += 1;
    else failed += 1;
  }

  await createCampaign(
    business_id,
    `${audience} blast`,
    audience,
    message,
    sent,
  );

  return NextResponse.json({
    audience,
    recipients: recipients.length,
    sent,
    failed,
    delivered: sent,
  });
}
