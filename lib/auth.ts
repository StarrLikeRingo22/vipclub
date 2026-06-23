// Auth: signed-cookie sessions + PBKDF2 password hashing.
// Edge + Node compatible (Web Crypto only, no deps).

export const SESSION_COOKIE = "vip_session";
export type Role = "owner" | "staff" | "admin";

export interface Session {
  sub: string;        // user id
  email: string;
  role: Role;
  businessId: string | null;
  name: string;
  exp: number;        // epoch seconds
}

const SECRET = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
const enc = new TextEncoder();

// ── base64url ───────────────────────────────────────────────────
function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function bytesFromB64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64url(str: string): string {
  return b64urlFromBytes(enc.encode(str));
}
function unb64url(str: string): string {
  return new TextDecoder().decode(bytesFromB64url(str));
}

// ── HMAC signing ────────────────────────────────────────────────
async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return b64urlFromBytes(new Uint8Array(sig));
}

export async function signSession(s: Session): Promise<string> {
  const payload = b64url(JSON.stringify(s));
  const sig = await hmac(payload);
  return `${payload}.${sig}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expected = await hmac(payload);
  if (sig !== expected) return null;
  try {
    const s = JSON.parse(unb64url(payload)) as Session;
    if (!s.exp || s.exp * 1000 < Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export function makeSession(u: { id: string; email: string; role: Role; business_id: string | null; name: string }): Session {
  return {
    sub: u.id, email: u.email, role: u.role, businessId: u.business_id,
    name: u.name, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
}

// ── Password hashing (PBKDF2-SHA256) ────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt);
  return `${b64urlFromBytes(salt)}:${b64urlFromBytes(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(":");
  if (!saltB64 || !hashB64) return false;
  const salt = bytesFromB64url(saltB64);
  const hash = await pbkdf2(password, salt);
  return b64urlFromBytes(hash) === hashB64;
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 100_000, hash: "SHA-256" },
    key, 256,
  );
  return new Uint8Array(bits);
}
