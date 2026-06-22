// Client-management data functions (notes, status, lookup, reminders).
// New module so the core db.ts stays untouched.
import type { Customer } from "./types";
import { isDbConfigured, dbQuery, dbUpdate } from "./sql";
import { db as mem } from "./store";
import { daysAgo } from "./util";

const useDb = isDbConfigured;

export async function getCustomerByPhone(businessId: string, phone: string): Promise<Customer | null> {
  const norm = phone.replace(/[^\d]/g, "");
  if (useDb) {
    const list = await dbQuery<Customer>(
      "select * from customers where business_id = $1",
      [businessId],
    );
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
  if (useDb) {
    return dbUpdate<Customer>("customers", id, patch as Record<string, unknown>);
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
  const all = useDb
    ? await dbQuery<Customer>("select * from customers where business_id = $1", [businessId])
    : mem().customers.filter((c) => c.business_id === businessId);
  return all.filter((c) => {
    if (!c.consent_sms || c.status === "unsubscribed") return false;
    const d = daysAgo(c.last_visit_date);
    return d !== null && d >= reminderDays && d <= reminderDays + 14; // due window
  });
}
