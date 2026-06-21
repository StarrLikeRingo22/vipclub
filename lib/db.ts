// Public data-access API used by route handlers.
// Chooses Supabase when configured, otherwise the in-memory store.

import type {
  Business, Service, Customer, Visit, Booking, Message, Campaign,
  SignupInput, BusinessStats, MessageType,
} from "./types";
import { isSupabaseConfigured, supabase } from "./supabase";
import { db as mem, applyVisit, redeemReward } from "./store";
import { uid, memberCode, nowIso, daysAgo } from "./util";

const useSb = isSupabaseConfigured;

// ── Businesses ──────────────────────────────────────────────────

export async function getBusiness(id: string): Promise<Business | null> {
  if (useSb) {
    const { data } = await supabase().from("businesses").select("*").eq("id", id).maybeSingle();
    return (data as Business) ?? null;
  }
  return mem().businesses.find((b) => b.id === id) ?? null;
}

export async function listBusinesses(): Promise<Business[]> {
  if (useSb) {
    const { data } = await supabase().from("businesses").select("*").order("created_at");
    return (data as Business[]) ?? [];
  }
  return mem().businesses;
}

// ── Services ────────────────────────────────────────────────────

export async function listServices(businessId: string): Promise<Service[]> {
  if (useSb) {
    const { data } = await supabase().from("services").select("*").eq("business_id", businessId);
    return (data as Service[]) ?? [];
  }
  return mem().services.filter((s) => s.business_id === businessId);
}

async function getService(id: string): Promise<Service | null> {
  if (useSb) {
    const { data } = await supabase().from("services").select("*").eq("id", id).maybeSingle();
    return (data as Service) ?? null;
  }
  return mem().services.find((s) => s.id === id) ?? null;
}

// ── Customers ───────────────────────────────────────────────────

export async function listCustomers(businessId: string): Promise<Customer[]> {
  if (useSb) {
    const { data } = await supabase()
      .from("customers").select("*").eq("business_id", businessId)
      .order("created_at", { ascending: false });
    return (data as Customer[]) ?? [];
  }
  return [...mem().customers].filter((c) => c.business_id === businessId);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  if (useSb) {
    const { data } = await supabase().from("customers").select("*").eq("id", id).maybeSingle();
    return (data as Customer) ?? null;
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

  if (useSb) {
    const { data, error } = await supabase().from("customers").insert(customer).select().single();
    if (error) throw new Error(error.message);
    return data as Customer;
  }
  mem().customers.unshift(customer);
  return customer;
}

export async function listVisits(customerId: string): Promise<Visit[]> {
  if (useSb) {
    const { data } = await supabase()
      .from("visits").select("*").eq("customer_id", customerId)
      .order("created_at", { ascending: false }).limit(10);
    return (data as Visit[]) ?? [];
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

  if (useSb) {
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
    const { data: updated, error } = await supabase()
      .from("customers").update(patch).eq("id", customerId).select().single();
    if (error) throw new Error(error.message);
    const visit: Visit = {
      id: uid("vis_"), business_id: customer.business_id, customer_id: customerId,
      service_id: null, service_name: serviceName, amount_spent: amount,
      points_added: 1, source: "booking", visit_date: nowIso(), created_at: nowIso(),
    };
    await supabase().from("visits").insert(visit);
    return {
      customer: updated as Customer,
      visit,
      rewardJustEarned: ready && newPoints === threshold,
    };
  }

  const customer = mem().customers.find((c) => c.id === customerId);
  if (!customer) throw new Error("Customer not found");
  return applyVisit(customer, threshold, serviceName, amount);
}

export async function redeem(customerId: string): Promise<Customer | null> {
  if (useSb) {
    const { data } = await supabase()
      .from("customers")
      .update({ points_balance: 0, reward_status: "redeemed" })
      .eq("id", customerId).select().single();
    return (data as Customer) ?? null;
  }
  const c = mem().customers.find((x) => x.id === customerId);
  return c ? redeemReward(c) : null;
}

// ── Bookings ────────────────────────────────────────────────────

export async function listBookings(businessId: string): Promise<Booking[]> {
  if (useSb) {
    const { data } = await supabase()
      .from("bookings").select("*").eq("business_id", businessId).order("time_label");
    return (data as Booking[]) ?? [];
  }
  return mem().bookings.filter((b) => b.business_id === businessId);
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (useSb) {
    const { data } = await supabase().from("bookings").select("*").eq("id", id).maybeSingle();
    return (data as Booking) ?? null;
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
  serviceId: string,
): Promise<CompleteResult> {
  const booking = await getBooking(bookingId);
  if (!booking) throw new Error("Booking not found");
  const service = await getService(serviceId);
  const serviceName = service?.name ?? "Service";
  const amount = service?.price ?? 0;

  if (useSb) {
    await supabase().from("bookings")
      .update({ status: "done", service_id: serviceId }).eq("id", bookingId);
  } else {
    booking.status = "done";
    booking.service_id = serviceId;
  }

  const visit = await addVisit(booking.customer_id, serviceName, amount);
  return { booking, amount, service, visit };
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
  if (useSb) {
    await supabase().from("messages").insert(msg);
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
  if (useSb) {
    await supabase().from("campaigns").insert(campaign);
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
    const loggedVisits = useSb
      ? ((await supabase().from("visits").select("id", { count: "exact", head: true }).eq("business_id", b.id)).count ?? 0)
      : mem().visits.filter((v) => v.business_id === b.id).length;
    const totalVisits = customers.reduce((a, c) => a + c.visit_count, 0) + loggedVisits;
    const returning = customers.filter((c) => c.visit_count >= 2).length;
    const messages = useSb
      ? ((await supabase().from("messages").select("id", { count: "exact", head: true }).eq("business_id", b.id)).count ?? 0)
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
