// Users (owner / staff / admin) — login accounts.
// Memory store by default; Neon `users` table when DATABASE_URL is set.

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

// Demo accounts (work with the zero-config in-memory backend).
const DEMO_USERS: User[] = [
  { id: "usr_owner", business_id: "biz_bella", name: "Bella Nguyen", email: "owner@bella.test", role: "owner", password_hash: null, demo_password: "vip12345", created_at: nowIso() },
  { id: "usr_staff", business_id: "biz_bella", name: "Tara (Stylist)", email: "staff@bella.test", role: "staff", password_hash: null, demo_password: "vip12345", created_at: nowIso() },
  { id: "usr_admin", business_id: null, name: "Platform Admin", email: "admin@vipclub.test", role: "admin", password_hash: null, demo_password: "vip12345", created_at: nowIso() },
];

const g = globalThis as unknown as { __vipUsers?: User[] };
function mem(): User[] {
  if (!g.__vipUsers) g.__vipUsers = structuredClone(DEMO_USERS);
  return g.__vipUsers;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const e = email.trim().toLowerCase();
  if (useDb) {
    return dbOne<User>("select * from users where email = $1", [e]);
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
    // demo_password is an app-only field, not a DB column — exclude it.
    const { demo_password, ...row } = user;
    void demo_password;
    return dbInsert<User>("users", row);
  }
  mem().push(user);
  return user;
}

export async function listStaff(businessId: string): Promise<User[]> {
  if (useDb) {
    return dbQuery<User>("select * from users where business_id = $1", [businessId]);
  }
  return mem().filter((u) => u.business_id === businessId);
}

export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;
  if (user.password_hash) {
    return (await verifyPassword(password, user.password_hash)) ? user : null;
  }
  // demo account
  return user.demo_password && user.demo_password === password ? user : null;
}
