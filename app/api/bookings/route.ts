import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { getBusiness, getCustomer, listServices } from "@/lib/db";
import { createBooking, timeLabel } from "@/lib/bookings";
import { buildIcs } from "@/lib/ics";
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar";
import { sendEmail, bookingEmailHtml, toBase64, isEmailConfigured } from "@/lib/email";
import { baseUrl } from "@/lib/util";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireRole(["owner", "staff"]);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const business_id = String(body.business_id ?? auth.session.businessId ?? "");
  const customer_id = String(body.customer_id ?? "");
  const service_id = String(body.service_id ?? "");
  const startsAt = String(body.starts_at ?? "");
  const duration_min = Number(body.duration_min ?? 45) || 45;
  const notes = body.notes ? String(body.notes) : null;

  if (!business_id || !customer_id || !service_id || !startsAt) {
    return NextResponse.json({ error: "business, customer, service and start time are required." }, { status: 400 });
  }
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "Invalid start time." }, { status: 400 });
  }

  const [business, customer, services] = await Promise.all([
    getBusiness(business_id),
    getCustomer(customer_id),
    listServices(business_id),
  ]);
  if (!business || !customer) {
    return NextResponse.json({ error: "Business or customer not found." }, { status: 404 });
  }
  const service = services.find((s) => s.id === service_id);
  const serviceName = service?.name ?? "Appointment";

  const booking = await createBooking({
    business_id, customer_id, customer_name: customer.full_name, service_id,
    starts_at: start.toISOString(), duration_min, notes, customer_email: customer.email,
  });

  // Build calendar assets.
  const title = `${serviceName} — ${business.business_name}`;
  const details = `Your ${serviceName} at ${business.business_name}. Booking: ${business.booking_url}`;
  const location = business.business_name;
  const ics = buildIcs({
    uid: `${booking.id}@vipclub`, start, durationMin: duration_min,
    title, description: details, location,
    organizerName: business.business_name,
    organizerEmail: process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] ?? "bookings@vipclub.app",
    attendeeEmail: customer.email,
  });
  const googleUrl = googleCalendarUrl({ title, start, durationMin: duration_min, details, location });
  const outlookUrl = outlookCalendarUrl({ title, start, durationMin: duration_min, details, location });
  const icsUrl = `${baseUrl()}/api/bookings/${booking.id}/ics`;

  // Email the customer (mock-logs until your sending domain is live).
  let emailStatus = "skipped (no email on file)";
  if (customer.email) {
    const res = await sendEmail({
      to: customer.email,
      subject: `Your booking at ${business.business_name} — ${timeLabel(start.toISOString())}`,
      html: bookingEmailHtml({
        customerName: customer.full_name, salon: business.business_name,
        service: serviceName, whenText: timeLabel(start.toISOString()),
        location, bookingUrl: business.booking_url, googleUrl, outlookUrl,
      }),
      attachments: [{ filename: "invite.ics", content: toBase64(ics), contentType: "text/calendar" }],
    });
    emailStatus = res.status;
  }

  return NextResponse.json({
    booking,
    calendar: { icsUrl, googleUrl, outlookUrl },
    email: { status: emailStatus, configured: isEmailConfigured },
  }, { status: 201 });
}
