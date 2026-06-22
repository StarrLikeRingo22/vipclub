// Reschedule / cancel / no-show + customer notifications (email .ics + SMS).
import type { Booking } from "./types";
import { isDbConfigured, dbUpdate } from "./sql";
import { db as mem } from "./store";
import { getBooking, getBusiness, getCustomer, listServices } from "./db";
import { timeLabel } from "./bookings";
import { buildIcs } from "./ics";
import { googleCalendarUrl, outlookCalendarUrl } from "./calendar";
import { sendEmail, bookingEmailHtml, toBase64 } from "./email";
import { sendSms } from "./sms";
import { baseUrl } from "./util";

const useDb = isDbConfigured;

function memUpdate(id: string, patch: Partial<Booking>): Booking | null {
  const b = mem().bookings.find((x) => x.id === id);
  if (!b) return null;
  Object.assign(b, patch);
  return b;
}

export async function rescheduleBooking(
  id: string, startsAtIso: string, durationMin?: number,
): Promise<Booking | null> {
  const current = await getBooking(id);
  if (!current) return null;
  const patch: Partial<Booking> = {
    starts_at: startsAtIso,
    time_label: timeLabel(startsAtIso),
    status: "scheduled",
    seq: (current.seq ?? 0) + 1,
    ...(durationMin ? { duration_min: durationMin } : {}),
  };
  if (useDb) {
    return dbUpdate<Booking>("bookings", id, patch);
  }
  return memUpdate(id, patch);
}

export async function cancelBooking(id: string, reason?: string): Promise<Booking | null> {
  const current = await getBooking(id);
  if (!current) return null;
  const patch: Partial<Booking> = {
    status: "cancelled",
    seq: (current.seq ?? 0) + 1,
    cancel_reason: reason ?? null,
  };
  if (useDb) {
    return dbUpdate<Booking>("bookings", id, patch);
  }
  return memUpdate(id, patch);
}

export async function markNoShow(id: string): Promise<Booking | null> {
  const patch: Partial<Booking> = { status: "cancelled", cancel_reason: "no-show" };
  if (useDb) {
    return dbUpdate<Booking>("bookings", id, patch);
  }
  return memUpdate(id, patch);
}

export type ChangeKind = "scheduled" | "rescheduled" | "cancelled";

export interface NotifyResult {
  emailStatus: string;
  smsStatus: string;
  calendar: { icsUrl: string; googleUrl?: string; outlookUrl?: string };
}

export async function notifyBookingChange(booking: Booking, kind: ChangeKind): Promise<NotifyResult> {
  const [business, customer, services] = await Promise.all([
    getBusiness(booking.business_id),
    getCustomer(booking.customer_id),
    listServices(booking.business_id),
  ]);
  const service = services.find((s) => s.id === booking.service_id);
  const serviceName = service?.name ?? "Appointment";
  const salon = business?.business_name ?? "VIP Club";
  const start = booking.starts_at ? new Date(booking.starts_at) : new Date();
  const duration = booking.duration_min ?? 45;
  const title = `${serviceName} — ${salon}`;
  const details = `Your ${serviceName} at ${salon}. ${business?.booking_url ?? ""}`;
  const cancelled = kind === "cancelled";

  const ics = buildIcs({
    uid: `${booking.id}@vipclub`, start, durationMin: duration, title,
    description: details, location: salon,
    organizerName: salon,
    organizerEmail: process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] ?? "bookings@vipclub.app",
    attendeeEmail: customer?.email,
    method: cancelled ? "CANCEL" : "REQUEST",
    sequence: booking.seq ?? 0,
  });
  const googleUrl = cancelled ? undefined : googleCalendarUrl({ title, start, durationMin: duration, details, location: salon });
  const outlookUrl = cancelled ? undefined : outlookCalendarUrl({ title, start, durationMin: duration, details, location: salon });
  const icsUrl = `${baseUrl()}/api/bookings/${booking.id}/ics`;

  const first = (customer?.full_name ?? "there").split(" ")[0];
  const whenText = booking.starts_at ? timeLabel(booking.starts_at) : booking.time_label;

  // Email
  let emailStatus = "skipped (no email)";
  if (customer?.email) {
    const subject = cancelled
      ? `Cancelled: your booking at ${salon}`
      : kind === "rescheduled"
        ? `Updated: your booking at ${salon} — ${whenText}`
        : `Your booking at ${salon} — ${whenText}`;
    const html = cancelled
      ? `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;color:#3A2C30"><h2>Booking cancelled</h2><p>Hi ${first}, your ${serviceName} at ${salon} (${whenText}) has been cancelled. The attached file removes it from your calendar. Hope to see you again soon.</p></div>`
      : bookingEmailHtml({
          customerName: customer.full_name, salon, service: serviceName,
          whenText: kind === "rescheduled" ? `${whenText} (updated)` : whenText,
          location: salon, bookingUrl: business?.booking_url ?? "",
          googleUrl: googleUrl ?? "", outlookUrl: outlookUrl ?? "",
        });
    const res = await sendEmail({
      to: customer.email, subject, html,
      attachments: [{ filename: cancelled ? "cancel.ics" : "invite.ics", content: toBase64(ics), contentType: "text/calendar" }],
    });
    emailStatus = res.status;
  }

  // SMS
  let smsStatus = "skipped";
  if (customer && customer.consent_sms && customer.phone) {
    const body = cancelled
      ? `Hi ${first}, your ${serviceName} at ${salon} on ${whenText} has been cancelled. Reply or visit ${business?.booking_url ?? ""} to rebook.`
      : kind === "rescheduled"
        ? `Hi ${first}, your ${serviceName} at ${salon} is now ${whenText}. See you then!`
        : `Hi ${first}, you're booked for ${serviceName} at ${salon} on ${whenText}.`;
    const res = await sendSms(customer.phone, body);
    smsStatus = res.status;
  }

  return { emailStatus, smsStatus, calendar: { icsUrl, googleUrl, outlookUrl } };
}
