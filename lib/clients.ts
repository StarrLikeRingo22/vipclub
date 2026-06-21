// Client-management data functions (notes, status, lookup, reminders).
// New module so the core db.ts stays untouched.
import type { Customer } from "./types";
import { isSupabaseConfigured, supabase } from "./supabase";
import { db as mem } from "./store";
import { daysAgo } from "./util";

const useSb = isSupabaseConfigured;

export async function getCustomerByPhone(businessId: string, phone: string): Promise<Customer | null> {
  const norm = phone.replace(/[^\d]/g, "");
  if (useSb) {
    const { data } = await supabase().from("customers").select("*").eq("business_id", businessId);
    const list = (data as Customer[]) ?? [];
    return list.find((c) => c.phone.replace(/[^\d]/g, "") === norm) ?? null;
  }
  return mem().customers.find(
    (c) => c.business_id === businessId && c.phone.replace(/[^\d]/g, "") === norm,
  ) ?? null;
}

export async function updateCustomer(
  id: string,
  patch: Partial<Pick<Customer, "notes" | "status" | "consent_sms">>,
): Promise<Customer | null> {
  if (useSb) {
    const { data } = await supabase().from("customers").update(patch).eq("id", id).select().single();
    return (data as Customer) ?? null;
  }
  const c = mem().customers.find((x) => x.id === id);
  if (!c) return null;
  Object.assign(c, patch);
  return c;
}

// Customers due for a rebooking reminder (last visit older than the window).
export async function customersDueForReminder(
  businessId: string,
  reminderDays: number,
): Promise<Customer[]> {
  const all = useSb
    ? (((await supabase().from("customers").select("*").eq("business_id", businessId)).data as Customer[]) ?? [])
    : mem().customers.filter((c) => c.business_id === businessId);
  return all.filter((c) => {
    if (!c.consent_sms || c.status === "unsubscribed") return false;
    const d = daysAgo(c.last_visit_date);
    return d !== null && d >= reminderDays && d <= reminderDays + 14; // due window
  });
}
