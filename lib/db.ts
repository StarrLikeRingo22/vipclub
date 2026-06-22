// Public data-access API used by route handlers.
// Chooses Neon (Postgres) when DATABASE_URL is set, otherwise the in-memory store.

import type {
  Business, Service, Customer, Visit, Booking, Message, Campaign,
  SignupInput, BusinessStats, MessageType,
} from "./types";
import { isDbConfigured, dbQuery, dbOne, dbInsert, dbUpdate, dbCount } from "./sql";
import { db as mem, applyVisit, redeemReward } from "./store";
import { uid, memberCode, nowIso, daysAgo } from "./util";

const useDb = isDbConfigured;

// ── Businesses ──────────────────────────────────────────────────

export async function getBusiness(id: string): Promise<Business | null> {
  if (useDb) {
    return dbOne<Business>("select * from businesses where id = $1", [id]);
  }
  return mem().businesses.find((b) => b.id === id) ?? null;
}

export async function listBusinesses(): Promise<Business[]> {
  if (useDb) {
    return dbQuery<Business>("select * from businesses order by created_at");
  }
  return mem().businesses;
}

// ── Services ────────────────────────────────────────────────────

export async function listServices(businessId: string): Promise<Service[]> {
  if (useDb) {
    return dbQuery<Service>("select * from services where business_id = $1 order by name", [businessId]);
  }
  return mem().services.filter((s) => s.business_id === businessId);
}

async function getService(id: string): Promise<Service | null> {
  if (useDb) {
    return dbOne<Service>("select * from services where id = $1", [id]);
  }
  return mem().services.find((s) => s.id === id) ?? null;
}

// ── Customers ───────────────────────────────────────────────────

export async function listCustomers(businessId: string): Promise<Customer[]> {
  if (useDb) {
    return dbQuery<Customer>(
      "select * from customers where business_id = $1 order by created_at desc",
      [businessId],
    );
  }
  return [...mem().customers].filter((c) => c.business_id === businessId);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  if (useDb) {
    return dbOne<Customer>("select * from customers where id = $1", [id]);
  }
  return mem().customers.find((c) => c.id === id) ?? null;
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
    return dbInsert<Customer>("customers", customer);
  }
  mem().customers.unshift(customer);
  return customer;
}

export async function listVisits(customerId: string): Promise<Visit[]> {
  if (useDb) {
    return dbQuery<Visit>(
      "select * from visits where customer_id = $1 order by created_at desc limit 10",
      [customerId],
    );
  }
  return mem().visits.filter((v) => v.customer_id === customerId);
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
    const customer = await getCustomer(customerId);
    if (!customer) throw new Error("Customer not found");
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
    if (!updated) throw new Error("Customer not found");
    const visit: Visit = {
      id: uid("vis_"), business_id: customer.business_id, customer_id: customerId,
      service_id: null, service_name: serviceName, amount_spent: amount,
      points_added: 1, source: "booking", visit_date: nowIso(), created_at: nowIso(),
    };
    await dbInsert<Visit>("visits", visit);
    return {
      customer: updated,
      visit,
      rewardJustEarned: ready && newPoints === threshold,
    };
  }

  const customer = mem().customers.find((c) => c.id === customerId);
  if (!customer) throw new Error("Customer not found");
  return applyVisit(customer, threshold, serviceName, amount);
}

export async function redeem(customerId: string): Promise<Customer | null> {
  if (useDb) {
    return dbUpdate<Customer>("customers", customerId, {
      points_balance: 0,
      reward_status: "redeemed",
    });
  }
  const c = mem().customers.find((x) => x.id === customerId);
  return c ? redeemReward(c) : null;
}

// ── Bookings ────────────────────────────────────────────────────

export async function listBookings(businessId: string): Promise<Booking[]> {
  if (useDb) {
    return dbQuery<Booking>(
      "select * from bookings where business_id = $1 order by time_label",
      [businessId],
    );
  }
  return mem().bookings.filter((b) => b.business_id === businessId);
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (useDb) {
    return dbOne<Booking>("select * from bookings where id = $1", [id]);
  }
  return mem().bookings.find((b) => b.id === id) ?? null;
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
    await dbUpdate("bookings", bookingId, { status: "done", service_id: joinedId });
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
    await dbInsert<Message>("messages", msg);
  } else {
    mem().messages.unshift(msg);
  }
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
    await dbInsert<Campaign>("campaigns", campaign);
  } else {
    mem().campaigns.unshift(campaign);
  }
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
    // Total visits = logged visit rows + each member's running visit_count.
    const loggedVisits = useDb
      ? await dbCount("visits", "business_id", b.id)
      : mem().visits.filter((v) => v.business_id === b.id).length;
    const totalVisits = customers.reduce((a, c) => a + c.visit_count, 0) + loggedVisits;
    const returning = customers.filter((c) => c.visit_count >= 2).length;
    const messages = useDb
      ? await dbCount("messages", "business_id", b.id)
      : mem().messages.filter((m) => m.business_id === b.id).length;
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
