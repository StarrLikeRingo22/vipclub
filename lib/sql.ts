// Neon Postgres data access. Used when DATABASE_URL is set; otherwise the app
// falls back to the seeded in-memory store (zero-config demo mode).
//
// We use the Neon serverless Pool with poolQueryViaFetch, so each single
// query is sent over low-latency HTTP (no WebSocket) - ideal for Vercel
// serverless functions. Queries are parameterized.
import { Pool, neonConfig } from "@neondatabase/serverless";

// Send individual Pool.query() calls over HTTP fetch instead of WebSockets.
neonConfig.poolQueryViaFetch = true;

const url = process.env.DATABASE_URL;

export const isDbConfigured = Boolean(url);

let _pool: Pool | null = null;

function pool(): Pool {
  if (!url) {
    throw new Error("DATABASE_URL is not set (Neon is not configured).");
  }
  if (!_pool) _pool = new Pool({ connectionString: url });
  return _pool;
}

// pg returns numeric/decimal as strings and timestamptz as Date objects.
// The app's types expect plain numbers and ISO strings, so normalize here.
const NUMERIC_COLS = new Set(["price", "amount_spent"]);

function normalizeRow<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v instanceof Date) out[k] = v.toISOString();
    else if (NUMERIC_COLS.has(k) && v !== null && v !== undefined) out[k] = Number(v);
    else out[k] = v;
  }
  return out as T;
}

/** Run a parameterized query and return all rows. */
export async function dbQuery<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const res = await pool().query(text, params);
  const rows = (res.rows ?? []) as Record<string, unknown>[];
  return rows.map((r) => normalizeRow<T>(r));
}

/** Run a query and return the first row, or null. */
export async function dbOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await dbQuery<T>(text, params);
  return rows[0] ?? null;
}

/** Insert a row from an object (keys = column names). Returns the inserted row. */
export async function dbInsert<T = Record<string, unknown>>(
  table: string,
  obj: object,
): Promise<T> {
  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record);
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const values = keys.map((k) => record[k]);
  const rows = await dbQuery<T>(
    `insert into ${table} (${cols}) values (${placeholders}) returning *`,
    values,
  );
  return rows[0];
}

/** Update a row by id from a patch object. Returns the updated row, or null. */
export async function dbUpdate<T = Record<string, unknown>>(
  table: string,
  id: string,
  patch: object,
): Promise<T | null> {
  const record = patch as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length === 0) {
    return dbOne<T>(`select * from ${table} where id = $1`, [id]);
  }
  const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
  const values = keys.map((k) => record[k]);
  const rows = await dbQuery<T>(
    `update ${table} set ${sets} where id = $${keys.length + 1} returning *`,
    [...values, id],
  );
  return rows[0] ?? null;
}

/** Count rows in a table matching a single equality filter. */
export async function dbCount(table: string, col: string, val: unknown): Promise<number> {
  const rows = await dbQuery<{ count: number }>(
    `select count(*)::int as count from ${table} where "${col}" = $1`,
    [val],
  );
  return rows[0]?.count ?? 0;
}

/** Build a clear, user-facing error for a failed write when Neon is configured. */
export function dbWriteError(e: unknown): Error {
  const detail = e instanceof Error ? e.message : "unknown error";
  return new Error(`Database not reachable — your change was not saved. Make sure DATABASE_URL is set and db/schema.sql has been run. (${detail})`);
}
