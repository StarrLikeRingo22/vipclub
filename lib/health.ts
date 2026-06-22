// Database health check for the owner/admin diagnostics and /api/health.
import { isDbConfigured, dbQuery } from "./sql";

const EXPECTED = ["businesses", "services", "customers", "visits", "bookings", "messages", "campaigns", "users", "referrals"];

export interface DbHealth {
  configured: boolean;
  connected: boolean;
  tables: Record<string, boolean>;
  missing: string[];
  error?: string;
}

export async function dbHealth(): Promise<DbHealth> {
  if (!isDbConfigured) {
    return { configured: false, connected: false, tables: {}, missing: EXPECTED };
  }
  try {
    const rows = await dbQuery<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public'",
    );
    const present = new Set(rows.map((r) => r.table_name));
    const tables: Record<string, boolean> = {};
    for (const t of EXPECTED) tables[t] = present.has(t);
    return { configured: true, connected: true, tables, missing: EXPECTED.filter((t) => !present.has(t)) };
  } catch (e) {
    return { configured: true, connected: false, tables: {}, missing: EXPECTED, error: e instanceof Error ? e.message : "unknown" };
  }
}
