import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { getBooking } from "@/lib/db";
import { rescheduleBooking, cancelBooking, markNoShow, notifyBookingChange } from "@/lib/booking-actions";

export const runtime = "nodejs";

// Reschedule a booking to a new time → re-issue calendar invite + notify.
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
  const startsAt = String(body.starts_at ?? "");
  const duration = body.duration_min ? Number(body.duration_min) : undefined;
  const start = new Date(startsAt);
  if (!startsAt || Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "Valid start time required." }, { status: 400 });
  }

  const booking = await rescheduleBooking(params.id, start.toISOString(), duration);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const notify = await notifyBookingChange(booking, "rescheduled");
  return NextResponse.json({ booking, notify });
}

// Cancel (or mark no-show) a booking.
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(["owner", "staff"]);
  if ("error" in auth) return auth.error;

  const url = new URL(req.url);
  const reason = url.searchParams.get("reason") ?? undefined;
  const noShow = url.searchParams.get("no_show") === "1";

  const existing = await getBooking(params.id);
  if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (noShow) {
    const booking = await markNoShow(params.id);
    return NextResponse.json({ booking, notify: { emailStatus: "skipped", smsStatus: "skipped" } });
  }

  const booking = await cancelBooking(params.id, reason);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  const notify = await notifyBookingChange(booking, "cancelled");
  return NextResponse.json({ booking, notify });
}
