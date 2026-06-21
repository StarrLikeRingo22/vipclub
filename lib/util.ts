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

export function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  );
}
