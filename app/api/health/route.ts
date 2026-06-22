import { NextResponse } from "next/server";
import { dbHealth } from "@/lib/health";
import { isTwilioConfigured } from "@/lib/sms";
import { isEmailConfigured } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const db = await dbHealth();
  const status = !db.configured
    ? "in-memory (demo — data does not persist)"
    : !db.connected
      ? "configured but unreachable"
      : db.missing.length
        ? "connected — schema incomplete (run db/schema.sql)"
        : "connected";
  return NextResponse.json({
    ok: db.configured ? db.connected && db.missing.length === 0 : true,
    database: {
      status,
      configured: db.configured,
      connected: db.connected,
      missingTables: db.missing,
      tables: db.tables,
      ...(db.error ? { error: db.error } : {}),
    },
    sms: isTwilioConfigured ? "twilio" : "mock (console)",
    email: isEmailConfigured ? "resend" : "mock (console)",
  });
}
