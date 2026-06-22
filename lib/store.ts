// In-memory data store (default backend — zero config).
// Persists for the lifetime of the server process / serverless instance.
// Swap to Supabase by setting SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.

import type {
  Business, Service, Customer, Visit, Booking, Message, Campaign,
} from "./types";
import {
  seedBusinesses, seedServices, seedCustomers, seedBookings,
} from "./seed";
import { uid, nowIso } from "./util";

interface DB {
  businesses: Business[];
  services: Service[];
  customers: Customer[];
  visits: Visit[];
  bookings: Booking[];
  messages: Message[];
  campaigns: Campaign[];
}

// Survive Next.js hot-reload by stashing on globalThis.
const g = globalThis as unknown as { __vipDB?: DB };

function fresh(): DB {
  return {
    businesses: structuredClone(seedBusinesses),
    services: structuredClone(seedServices),
    customers: structuredClone(seedCustomers),
    visits: [],
    bookings: structuredClone(seedBookings),
    messages: [],
    campaigns: [],
  };
}

export function db(): DB {
  if (!g.__vipDB) g.__vipDB = fresh();
  return g.__vipDB;
}

// ── Reward logic ────────────────────────────────────────────────

export function applyVisit(
  c: Customer,
  threshold: number,
  serviceName: string,
  amount: number,
): { customer: Customer; visit: Visit; rewardJustEarned: boolean } {
  const data = db();
  const newCount = c.visit_count + 1;
  const newPoints = c.points_balance + 1;
  const ready = newPoints >= threshold;

  c.visit_count = newCount;
  c.points_balance = newPoints;
  c.last_visit_date = nowIso();
  c.status = "active";
  c.reward_status = ready ? "ready" : "earning";

  const visit: Visit = {
    id: uid("vis_"),
    business_id: c.business_id,
    customer_id: c.id,
    service_id: null,
    service_name: serviceName,
    amount_spent: amount,
    points_added: 1,
    source: "booking",
    visit_date: nowIso(),
    created_at: nowIso(),
  };
  data.visits.unshift(visit);

  return { customer: c, visit, rewardJustEarned: ready && newPoints === threshold };
}

export function redeemReward(c: Customer): Customer {
  c.points_balance = 0;
  c.reward_status = "redeemed";
  return c;
}
