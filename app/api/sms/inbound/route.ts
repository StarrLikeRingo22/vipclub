import { NextRequest, NextResponse } from "next/server";
import { listBusinesses } from "@/lib/db";
import { getCustomerByPhone, updateCustomer } from "@/lib/clients";

export const runtime = "nodejs";

// Inbound SMS webhook (point your Twilio number's "A message comes in" here).
// Handles STOP/UNSUBSCRIBE and START/UNSTOP. Accepts Twilio form-encoded body.
export async function POST(req: NextRequest) {
  let from = "";
  let text = "";
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const b = await req.json().catch(() => ({}));
    from = String(b.From ?? b.from ?? "");
    text = String(b.Body ?? b.body ?? "");
  } else {
    const form = await req.formData().catch(() => null);
    from = String(form?.get("From") ?? "");
    text = String(form?.get("Body") ?? "");
  }

  const word = text.trim().toUpperCase();
  const isStop = ["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"].includes(word);
  const isStart = ["START", "UNSTOP", "YES"].includes(word);

  if (from && (isStop || isStart)) {
    const businesses = await listBusinesses();
    for (const b of businesses) {
      const c = await getCustomerByPhone(b.id, from);
      if (c) {
        await updateCustomer(c.id, {
          consent_sms: !isStop,
          status: isStop ? "unsubscribed" : "active",
        });
      }
    }
  }

  // Twilio expects TwiML (empty = no auto-reply; carriers send the STOP confirmation).
  return new NextResponse("<Response></Response>", {
    headers: { "Content-Type": "text/xml" },
  });
}
