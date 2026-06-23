// Public data-access API used by route handlers.
// Uses Neon (Postgres) when DATABASE_URL is set, otherwise the in-memory store.
// Every DB call falls back to the in-memory demo store if Neon errors (e.g. the
// schema has not been run yet), so the app is always usable.

import type {
  Business, Service, Customer, Visit, Booking, Message, Campaign,
  SignupInput, BusinessStats, MessageType,
} from "./types";
import { isDbConfigured, dbQuery, dbOne, dbInsert, dbUpdate, dbCount, dbWriteError } from "./sql";
import { db as mem, applyVisit, redeemReward } from "./store";
import { uid, memberCode, nowIso, daysAgo } from "./util";

const useDb = isDbConfigured;

// Run a DB function, falling back to the in-memory implementation on any error.
async function withDb<T>(dbFn: () => Promise<T>, memFn: () => T): Promise<T> {
  if (useDb) {
    try {
      return await dbFn();
    } catch {
      return memFn();
    }
  }
  return memFn();
}

// ── Businesses ──────────────────────────────────────────────────

export async function getBusiness(id: string): Promise<Business | null> {
  return withDb(
    () => dbOne<Business>("select * from businesses where id = $1", [id]),
    () => mem().businesses.find((b) => b.id === id) ?? null,
  );
}

export async function listBusinesses(): Promise<Business[]> {
  return withDb(
    () => dbQuery<Business>("select * from businesses order by created_at"),
    () => mem().businesses,
  );
}

export async function createBusiness(input: {
  business_name: string; business_type: string;
  reward_threshold?: number; default_reminder_days?: number; booking_url?: string;
}): Promise<Business> {
  const biz: Business = {
    id: uid("biz_"),
    business_name: input.business_name.trim(),
    business_type: input.business_type.trim() || "Salon",
    booking_url: input.booking_url ?? "",
    reward_threshold: input.reward_threshold ?? 5,
    default_reminder_days: input.default_reminder_days ?? 35,
    twilio_number: null,
    created_at: nowIso(),
  };
  if (useDb) {
    try { return await dbInsert<Business>("businesses", biz); }
    catch (e) { throw dbWriteError(e); }
  }
  mem().businesses.push(biz);
  return biz;
}

// ── Services ────────────────────────────────────────────────────

export async function listServices(businessId: string): Promise<Service[]> {
  return withDb(
    () => dbQuery<Service>("select * from services where business_id = $1 order by name", [businessId]),
    () => mem().services.filter((s) => s.business_id === businessId),
  );
}

export async function createService(input: {
  business_id: string; category: string; name: string; price: number; duration_min: number;
}): Promise<Service> {
  const svc: Service = {
    id: uid("svc_"),
    business_id: input.business_id,
    category: input.category.trim() || "Other",
    name: input.name.trim(),
    price: Number(input.price) || 0,
    duration_min: Number(input.duration_min) || 30,
  };
  if (useDb) {
    try { return await dbInsert<Service>("services", svc); }
    catch (e) { throw dbWriteError(e); }
  }
  mem().services.push(svc);
  return svc;
}

export async function createServices(rows: Array<{ business_id: string; category: string; name: string; price: number; duration_min: number }>): Promise<void> {
  for (const r of rows) { try { await createService(r); } catch { /* best effort for starter menu */ } }
}

// ── Customers ───────────────────────────────────────────────────

export async function listCustomers(businessId: string): Promise<Customer[]> {
  return withDb(
    () => dbQuery<Customer>("select * from customers where business_id = $1 order by created_at desc", [businessId]),
    () => [...mem().customers].filter((c) => c.business_id === businessId),
  );
}

export async function getCustomer(id: string): Promise<Customer | null> {
  return withDb(
    () => dbOne<Customer>("select * from customers where id = $1", [id]),
    () => mem().customers.find((c) => c.id === id) ?? null,
  );
}

export async function createCustomer(input: SignupInput): Promise<Customer> {
  const customer: Customer = {
    id: uid("cus_"),
    business_id: input.business_id,
    full_name: input.full_name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    birthday: input.birthday?.trim() || null,
    consent_sms: input.consent_sms,
    status: "active",
    customer_code: memberCode(input.full_name),
    visit_count: 0,
    points_balance: 0,
    last_visit_date: null,
    reward_status: "earning",
    created_at: nowIso(),
  };

  if (useDb) {
    try {
      return await dbInsert<Customer>("customers", customer);
    } catch (e) {
      throw dbWriteError(e);
    }
  }
  mem().customers.unshift(customer);
  return customer;
}

export async function listVisits(customerId: string): Promise<Visit[]> {
  return withDb(
    () => dbQuery<Visit>("select * from visits where customer_id = $1 order by created_at desc limit 10", [customerId]),
    () => mem().visits.filter((v) => v.customer_id === customerId),
  );
}

// ── Visit logging + rewards ─────────────────────────────────────

export interface VisitResult {
  customer: Customer;
  visit: Visit;
  rewardJustEarned: boolean;
}

export async function addVisit(
  customerId: string,
  serviceName: string,
  amount: number,
): Promise<VisitResult> {
  const business = await businessForCustomer(customerId);
  const threshold = business?.reward_threshold ?? 5;

  if (useDb) {
    try {
      const customer = await dbOne<Customer>("select * from customers where id = $1", [customerId]);
      if (customer) {
        const newPoints = customer.points_balance + 1;
        const ready = newPoints >= threshold;
        const patch = {
          visit_count: customer.visit_count + 1,
          points_balance: newPoints,
          last_visit_date: nowIso(),
          status: "active" as const,
          reward_status: (ready ? "ready" : "earning") as Customer["reward_status"],
        };
        const updated = await dbUpdate<Customer>("customers", customerId, patch);
        if (updated) {
          const visit: Visit = {
            id: uid("vis_"), business_id: customer.business_id, customer_id: customerId,
            service_id: null, service_name: serviceName, amount_spent: amount,
            points_added: 1, source: "booking", visit_date: nowIso(), created_at: nowIso(),
          };
          await dbInsert<Visit>("visits", visit);
          return { customer: updated, visit, rewardJustEarned: ready && newPoints === threshold };
        }
      }
    } catch (e) {
      throw dbWriteError(e);
    }
  }

  const customer = mem().customers.find((c) => c.id === customerId);
  if (!customer) throw new Error("Customer not found");
  return applyVisit(customer, threshold, serviceName, amount);
}

export async function redeem(customerId: string): Promise<Customer | null> {
  if (useDb) {
    try {
      const updated = await dbUpdate<Customer>("customers", customerId, {
        points_balance: 0,
        reward_status: "redeemed",
      });
      if (updated) return updated;
    } catch (e) {
      throw dbWriteError(e);
    }
  }
  const c = mem().customers.find((x) => x.id === customerId);
  return c ? redeemReward(c) : null;
}

// ── Bookings ────────────────────────────────────────────────────

export async function listBookings(businessId: string): Promise<Booking[]> {
  return withDb(
    () => dbQuery<Booking>("select * from bookings where business_id = $1 order by time_label", [businessId]),
    () => mem().bookings.filter((b) => b.business_id === businessId),
  );
}

export async function getBooking(id: string): Promise<Booking | null> {
  return withDb(
    () => dbOne<Booking>("select * from bookings where id = $1", [id]),
    () => mem().bookings.find((b) => b.id === id) ?? null,
  );
}

export interface CompleteResult {
  booking: Booking;
  amount: number;
  service: Service | null;
  visit: VisitResult | null;
}

export async function completeBooking(
  bookingId: string,
  serviceIds: string[],
): Promise<CompleteResult> {
  const booking = await getBooking(bookingId);
  if (!booking) throw new Error("Booking not found");

  const all = await listServices(booking.business_id);
  const chosen = serviceIds
    .map((id) => all.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));

  const serviceName = chosen.length ? chosen.map((s) => s.name).join(", ") : "Service";
  const amount = chosen.reduce((a, s) => a + s.price, 0);
  const joinedId = serviceIds.join(",");

  if (useDb) {
    try {
      await dbUpdate("bookings", bookingId, { status: "done", service_id: joinedId });
    } catch (e) {
      throw dbWriteError(e);
    }
  } else {
    booking.status = "done";
    booking.service_id = joinedId;
  }

  const visit = await addVisit(booking.customer_id, serviceName, amount);
  return { booking, amount, service: chosen[0] ?? null, visit };
}

// ── Messages + campaigns ────────────────────────────────────────

export async function recordMessage(
  businessId: string,
  customerId: string | null,
  type: MessageType,
  body: string,
  status: Message["status"],
  sid: string | null,
): Promise<Message> {
  const msg: Message = {
    id: uid("msg_"), business_id: businessId, customer_id: customerId,
    message_type: type, body, status, provider_sid: sid, sent_at: nowIso(),
  };
  if (useDb) {
    try {
      await dbInsert<Message>("messages", msg);
      return msg;
    } catch (e) {
      throw dbWriteError(e);
    }
  }
  mem().messages.unshift(msg);
  return msg;
}

export async function createCampaign(
  businessId: string,
  name: string,
  audience: string,
  body: string,
  sentCount: number,
): Promise<Campaign> {
  const campaign: Campaign = {
    id: uid("cmp_"), business_id: businessId, campaign_name: name,
    audience_type: audience, message_body: body, sent_count: sentCount,
    created_at: nowIso(),
  };
  if (useDb) {
    try {
      await dbInsert<Campaign>("campaigns", campaign);
      return campaign;
    } catch (e) {
      throw dbWriteError(e);
    }
  }
  mem().campaigns.unshift(campaign);
  return campaign;
}

export async function audienceFor(businessId: string, audience: string): Promise<Customer[]> {
  const all = (await listCustomers(businessId)).filter((c) => c.consent_sms && c.status !== "unsubscribed");
  switch (audience) {
    case "inactive":
      return all.filter((c) => (daysAgo(c.last_visit_date) ?? 999) >= 30);
    case "reward":
      return all.filter((c) => c.reward_status === "ready" || c.points_balance >= 3);
    case "all":
    default:
      return all;
  }
}

// ── Admin stats ─────────────────────────────────────────────────

export async function businessStats(): Promise<BusinessStats[]> {
  const businesses = await listBusinesses();
  const out: BusinessStats[] = [];
  for (const b of businesses) {
    const customers = await listCustomers(b.id);
    const members = customers.length;
    const loggedVisits = await withDb(
      () => dbCount("visits", "business_id", b.id),
      () => mem().visits.filter((v) => v.business_id === b.id).length,
    );
    const totalVisits = customers.reduce((a, c) => a + c.visit_count, 0) + loggedVisits;
    const returning = customers.filter((c) => c.visit_count >= 2).length;
    const messages = await withDb(
      () => dbCount("messages", "business_id", b.id),
      () => mem().messages.filter((m) => m.business_id === b.id).length,
    );
    const newThisMonth = customers.filter((c) => (daysAgo(c.created_at) ?? 999) <= 30).length;
    out.push({
      business_id: b.id,
      business_name: b.business_name,
      business_type: b.business_type,
      members,
      visits: totalVisits,
      returning_rate: members ? Math.round((returning / members) * 100) : 0,
      avg_visits: members ? Math.round((totalVisits / members) * 10) / 10 : 0,
      rewards_ready: customers.filter((c) => c.reward_status === "ready").length,
      inactive: customers.filter((c) => (daysAgo(c.last_visit_date) ?? 999) >= 30).length,
      messages_sent: messages,
      new_this_month: newThisMonth,
    });
  }
  return out;
}

async function businessForCustomer(customerId: string): Promise<Business | null> {
  const c = await getCustomer(customerId);
  if (!c) return null;
  return getBusiness(c.business_id);
}
