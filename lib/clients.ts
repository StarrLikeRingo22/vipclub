// Client-management data functions (notes, status, lookup, reminders).
import type { Customer } from "./types";
import { isDbConfigured, dbQuery, dbUpdate, dbWriteError } from "./sql";
import { db as mem } from "./store";
import { daysAgo } from "./util";

const useDb = isDbConfigured;

export async function getCustomerByPhone(businessId: string, phone: string): Promise<Customer | null> {
  const norm = phone.replace(/[^\d]/g, "");
  if (useDb) {
    try {
      const list = await dbQuery<Customer>("select * from customers where business_id = $1", [businessId]);
      return list.find((c) => c.phone.replace(/[^\d]/g, "") === norm) ?? null;
    } catch {
      /* fall back to in-memory for reads */
    }
  }
  return mem().customers.find(
    (c) => c.business_id === businessId && c.phone.replace(/[^\d]/g, "") === norm,
  ) ?? null;
}

export async function updateCustomer(
  id: string,
  patch: Partial<Pick<Customer, "notes" | "status" | "consent_sms" | "referred_by">>,
): Promise<Customer | null> {
  if (useDb) {
    try {
      return await dbUpdate<Customer>("customers", id, patch as Record<string, unknown>);
    } catch (e) {
      throw dbWriteError(e);
    }
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
  let all: Customer[];
  if (useDb) {
    try {
      all = await dbQuery<Customer>("select * from customers where business_id = $1", [businessId]);
    } catch {
      all = mem().customers.filter((c) => c.business_id === businessId);
    }
  } else {
    all = mem().customers.filter((c) => c.business_id === businessId);
  }
  return all.filter((c) => {
    if (!c.consent_sms || c.status === "unsubscribed") return false;
    const d = daysAgo(c.last_visit_date);
    return d !== null && d >= reminderDays && d <= reminderDays + 14;
  });
}
