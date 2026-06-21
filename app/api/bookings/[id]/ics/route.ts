import { NextRequest, NextResponse } from "next/server";
import { getBooking, getBusiness, listServices } from "@/lib/db";
import { buildIcs } from "@/lib/ics";

export const runtime = "nodejs";

// Public .ics download for a booking (so the customer can re-add it anytime).
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const booking = await getBooking(params.id);
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [business, services] = await Promise.all([
    getBusiness(booking.business_id),
    listServices(booking.business_id),
  ]);
  const service = services.find((s) => s.id === booking.service_id);
  const serviceName = service?.name ?? "Appointment";

  // Fall back to "today at noon" if a seeded booking has no exact time.
  const start = booking.starts_at ? new Date(booking.starts_at) : noonToday();
  const duration = booking.duration_min ?? 45;
  const salon = business?.business_name ?? "VIP Club";

  const ics = buildIcs({
    uid: `${booking.id}@vipclub`, start, durationMin: duration,
    title: `${serviceName} — ${salon}`,
    description: `Your ${serviceName} at ${salon}. ${business?.booking_url ?? ""}`,
    location: salon,
    organizerName: salon,
    organizerEmail: "bookings@vipclub.app",
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="vipclub-${booking.id}.ics"`,
    },
  });
}

function noonToday(): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d;
}
