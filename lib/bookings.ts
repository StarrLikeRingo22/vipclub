// Booking creation (scheduling). New module so the core db.ts stays untouched.
import type { Booking } from "./types";
import { isDbConfigured, dbInsert } from "./sql";
import { db as mem } from "./store";
import { uid, nowIso } from "./util";

const useDb = isDbConfigured;

export interface NewBooking {
  business_id: string;
  customer_id: string;
  customer_name: string;
  service_id: string;
  starts_at: string;       // ISO
  duration_min: number;
  notes?: string | null;
  customer_email?: string | null;
}

export function timeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

export async function createBooking(input: NewBooking): Promise<Booking> {
  const booking: Booking = {
    id: uid("bk_"),
    business_id: input.business_id,
    customer_id: input.customer_id,
    customer_name: input.customer_name,
    service_id: input.service_id,
    time_label: timeLabel(input.starts_at),
    status: "scheduled",
    created_at: nowIso(),
    starts_at: input.starts_at,
    duration_min: input.duration_min,
    notes: input.notes ?? null,
    customer_email: input.customer_email ?? null,
  };
  if (useDb) {
    return dbInsert<Booking>("bookings", booking);
  }
  mem().bookings.push(booking);
  return booking;
}
