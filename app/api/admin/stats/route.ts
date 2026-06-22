import { NextResponse } from "next/server";
import { businessStats } from "@/lib/db";
import { isDbConfigured } from "@/lib/sql";
import { isTwilioConfigured } from "@/lib/sms";
import { requireRole } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireRole(["admin"]);
  if ("error" in auth) return auth.error;

  const stats = await businessStats();

  const totalMembers = stats.reduce((a, s) => a + s.members, 0);
  const totalVisits = stats.reduce((a, s) => a + s.visits, 0);
  const totalReturning = stats.reduce((a, s) => a + Math.round((s.returning_rate / 100) * s.members), 0);

  const totals = {
    businesses: stats.length,
    members: totalMembers,
    visits: totalVisits,
    rewards_ready: stats.reduce((a, s) => a + s.rewards_ready, 0),
    inactive: stats.reduce((a, s) => a + s.inactive, 0),
    messages: stats.reduce((a, s) => a + s.messages_sent, 0),
    new_this_month: stats.reduce((a, s) => a + s.new_this_month, 0),
    returning_rate: totalMembers ? Math.round((totalReturning / totalMembers) * 100) : 0,
  };

  return NextResponse.json({
    businesses: stats,
    totals,
    backend: {
      database: isDbConfigured ? "neon (postgres)" : "in-memory (demo)",
      sms: isTwilioConfigured ? "twilio" : "mock (console)",
    },
  });
}
