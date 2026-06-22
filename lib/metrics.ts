// Aggregate per-business metrics for the owner dashboard.
// Uses Neon when configured, falls back to the in-memory demo store on any error.
import { isDbConfigured, dbQuery, dbCount } from "./sql";
import { db as mem } from "./store";

const useDb = isDbConfigured;

export interface BusinessMetrics {
  messagesSent: number;
  visitsLogged: number;   // rows in the visits log
  revenueLogged: number;  // sum of amount_spent on logged visits
  referrals: number;
}

export async function businessMetrics(businessId: string): Promise<BusinessMetrics> {
  if (useDb) {
    try {
      const [messagesSent, visits, referrals] = await Promise.all([
        dbCount("messages", "business_id", businessId),
        dbQuery<{ amount_spent: number }>("select amount_spent from visits where business_id = $1", [businessId]),
        dbCount("referrals", "business_id", businessId).catch(() => 0),
      ]);
      return {
        messagesSent,
        visitsLogged: visits.length,
        revenueLogged: visits.reduce((a, v) => a + (Number(v.amount_spent) || 0), 0),
        referrals,
      };
    } catch {
      /* fall through to in-memory */
    }
  }
  const m = mem();
  const visits = m.visits.filter((v) => v.business_id === businessId);
  return {
    messagesSent: m.messages.filter((x) => x.business_id === businessId).length,
    visitsLogged: visits.length,
    revenueLogged: visits.reduce((a, v) => a + (v.amount_spent || 0), 0),
    referrals: 0,
  };
}
