// Users (owner / staff / admin) - login accounts.
// Memory store by default; Neon `users` table when DATABASE_URL is set.
// DB lookups fall back to the seeded demo accounts if the table is missing or
// unreachable, so the demo logins always work even before the schema is run.

import { isDbConfigured, dbOne, dbQuery, dbInsert } from "./sql";
import { hashPassword, verifyPassword, type Role } from "./auth";
import { uid, nowIso } from "./util";

export interface User {
  id: string;
  business_id: string | null;
  name: string;
  email: string;
  role: Role;
  password_hash: string | null;
  demo_password?: string | null; // demo accounts only (no hash)
  created_at: string;
}

const useDb = isDbConfigured;

// Shared password for the built-in demo accounts (null password_hash).
const DEMO_PASSWORD = "vip12345";

// Demo accounts (work with the zero-config in-memory backend AND as a fallback
// in DB mode so the app is always usable).
const DEMO_USERS: User[] = [
  { id: "usr_owner", business_id: "biz_bella", name: "Bella Nguyen", email: "owner@bella.test", role: "owner", password_hash: null, demo_password: DEMO_PASSWORD, created_at: nowIso() },
  { id: "usr_staff", business_id: "biz_bella", name: "Tara Stylist", email: "staff@bella.test", role: "staff", password_hash: null, demo_password: DEMO_PASSWORD, created_at: nowIso() },
  { id: "usr_admin", business_id: null, name: "Platform Admin", email: "admin@vipclub.test", role: "admin", password_hash: null, demo_password: DEMO_PASSWORD, created_at: nowIso() },
];

const g = globalThis as unknown as { __vipUsers?: User[] };
function mem(): User[] {
  if (!g.__vipUsers) g.__vipUsers = structuredClone(DEMO_USERS);
  return g.__vipUsers;
}

function demoByEmail(email: string): User | null {
  return DEMO_USERS.find((u) => u.email.toLowerCase() === email) ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const e = email.trim().toLowerCase();
  if (useDb) {
    try {
      const u = await dbOne<User>("select * from users where email = $1", [e]);
      // If the row exists in Neon, use it; otherwise fall back to a demo account.
      return u ?? demoByEmail(e);
    } catch {
      // Table missing / DB unreachable - keep the demo logins working.
      return demoByEmail(e);
    }
  }
  return mem().find((u) => u.email.toLowerCase() === e) ?? null;
}

export async function createUser(input: {
  email: string; password: string; role: Role; business_id: string | null; name: string;
}): Promise<User> {
  const password_hash = await hashPassword(input.password);
  const user: User = {
    id: uid("usr_"), business_id: input.business_id, name: input.name,
    email: input.email.trim().toLowerCase(), role: input.role,
    password_hash, demo_password: null, created_at: nowIso(),
  };
  if (useDb) {
    // demo_password is an app-only field, not a DB column - exclude it.
    const { demo_password, ...row } = user;
    void demo_password;
    return dbInsert<User>("users", row);
  }
  mem().push(user);
  return user;
}

export async function listStaff(businessId: string): Promise<User[]> {
  if (useDb) {
    try {
      return await dbQuery<User>("select * from users where business_id = $1", [businessId]);
    } catch {
      return mem().filter((u) => u.business_id === businessId);
    }
  }
  return mem().filter((u) => u.business_id === businessId);
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (user.password_hash) {
    return (await verifyPassword(password, user.password_hash)) ? user : null;
  }
  // No hash -> demo account (seeded with null hash). Accept the demo password.
  const expected = user.demo_password ?? DEMO_PASSWORD;
  return password === expected ? user : null;
}
