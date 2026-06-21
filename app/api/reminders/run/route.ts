import { NextRequest, NextResponse } from "next/server";
import { listBusinesses, recordMessage } from "@/lib/db";
import { customersDueForReminder } from "@/lib/clients";
import { sendSms } from "@/lib/sms";

export const runtime = "nodejs";

// Rebooking-reminder engine. Wire to Vercel Cron (see vercel.json).
// Protected by CRON_SECRET when set; open in the zero-config demo.
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const businesses = await listBusinesses();
  let total = 0;
  const perShop: { business: string; due: number; sent: number }[] = [];

  for (const b of businesses) {
    const due = await customersDueForReminder(b.id, b.default_reminder_days);
    let sent = 0;
    for (const c of due) {
      const first = c.full_name.split(" ")[0];
      const body =
        `Hey ${first}, you're probably due for a fresh look 👀 ` +
        `You're getting closer to your next VIP reward at ${b.business_name}. ` +
        `Book here: ${b.booking_url}`;
      const res = await sendSms(c.phone, body);
      await recordMessage(b.id, c.id, "reminder", body, res.status, res.sid);
      if (res.ok) sent += 1;
    }
    total += sent;
    perShop.push({ business: b.business_name, due: due.length, sent });
  }

  return NextResponse.json({ ran_at: new Date().toISOString(), total_sent: total, per_shop: perShop });
}

// Allow GET so Vercel Cron (which sends GET) can trigger it too.
export async function GET(req: NextRequest) {
  return POST(req);
}
