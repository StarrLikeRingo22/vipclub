// Small id / code helpers (no external deps)

export function uid(prefix = ""): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}${time}${rand}`;
}

export function memberCode(name: string): string {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 6).toUpperCase() || "VIP";
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${base}${n}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function daysAgo(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

// Public base URL used to build QR codes, pass links, and calendar invites.
// Always resolves to the live site in production (never localhost), so a QR
// printed for the front desk leads to the real website.
const PROD_FALLBACK = "https://vipclub-six-navy.vercel.app";

export function baseUrl(): string {
  const env = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  // Honour an explicit public URL, but never a localhost value in production.
  if (env && !/localhost|127\.0\.0\.1/.test(env)) return env;

  // Vercel exposes the canonical production domain on every deployment.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Local development falls back to the localhost value if that's all we have.
  if (env) return env;
  return PROD_FALLBACK;
}
