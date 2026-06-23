"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crest } from "@/components/Crest";
import type { BusinessStats } from "@/lib/types";

interface Totals {
  businesses: number; members: number; visits: number; rewards_ready: number;
  inactive: number; messages: number; new_this_month: number; returning_rate: number;
}
interface Stats { businesses: BusinessStats[]; totals: Totals; backend: { database: string; sms: string }; }
interface BizRow { id: string; business_name: string; business_type: string; reward_threshold: number; }

type Sort = "returning" | "members" | "visits";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [sort, setSort] = useState<Sort>("returning");
  const [businesses, setBusinesses] = useState<BizRow[]>([]);
  const [origin, setOrigin] = useState("");
  const [form, setForm] = useState({ business_name: "", business_type: "Salon", owner_name: "", owner_email: "", owner_password: "" });
  const [msg, setMsg] = useState("");
  const [creating, setCreating] = useState(false);

  async function signOut() { try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ } router.push("/"); router.refresh(); }

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => {});
    fetch("/api/admin/businesses").then((r) => r.json()).then((d) => setBusinesses(d.businesses ?? [])).catch(() => {});
  }, []);

  async function createBusiness(e: React.FormEvent) {
    e.preventDefault(); setMsg(""); setCreating(true);
    try {
      const res = await fetch("/api/admin/businesses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setBusinesses((b) => [{ id: d.business.id, business_name: d.business.business_name, business_type: d.business.business_type, reward_threshold: 5 }, ...b]);
      setForm({ business_name: "", business_type: "Salon", owner_name: "", owner_email: "", owner_password: "" });
      setMsg(`Created ${d.business.business_name}. Owner login: ${d.owner.email}`);
    } catch (err) { setMsg(err instanceof Error ? err.message : "Failed"); } finally { setCreating(false); }
  }

  const shops = useMemo(() => {
    if (!stats) return [];
    const s = [...stats.businesses];
    s.sort((a, b) => sort === "members" ? b.members - a.members : sort === "visits" ? b.visits - a.visits : b.returning_rate - a.returning_rate);
    return s;
  }, [stats, sort]);

  const field = "w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-[15px]";
  const card = "card-shadow rounded-2xl border border-line bg-white";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Crest size={42} />
          <div>
            <h1 className="font-serif text-xl font-bold sm:text-2xl">VIP Club — Platform Admin</h1>
            <p className="text-[11px] font-semibold uppercase tracking-[2px] text-rose-deep">Manage businesses &amp; performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats && <div className="hidden rounded-xl border border-line bg-white px-3 py-2 text-[11px] text-ink-soft sm:block">DB <b className="text-ink">{stats.backend.database}</b> · SMS <b className="text-ink">{stats.backend.sms}</b></div>}
          <Link href="/" className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-ink-soft hover:text-ink">Home</Link>
          <button onClick={signOut} className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-ink-soft hover:text-ink">Sign out</button>
        </div>
      </div>

      {/* ── Manage businesses ── */}
      <div className="mt-7 grid gap-4 lg:grid-cols-2">
        <form onSubmit={createBusiness} className={card + " p-5"}>
          <h2 className="font-serif text-lg font-bold">Add a business</h2>
          <p className="mb-3 mt-1 text-sm text-ink-soft">Creates the business, an owner login, and a starter service menu.</p>
          <div className="grid grid-cols-2 gap-2">
            <input className={field + " col-span-2"} placeholder="Business name" value={form.business_name} onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))} />
            <select className={field} value={form.business_type} onChange={(e) => setForm((f) => ({ ...f, business_type: e.target.value }))}>
              <option>Salon</option><option>Hair Salon</option><option>Barbershop</option><option>Nail Salon</option><option>Lash Studio</option><option>Spa</option>
            </select>
            <input className={field} placeholder="Owner name" value={form.owner_name} onChange={(e) => setForm((f) => ({ ...f, owner_name: e.target.value }))} />
            <input className={field} type="email" placeholder="Owner email" value={form.owner_email} onChange={(e) => setForm((f) => ({ ...f, owner_email: e.target.value }))} />
            <input className={field} type="password" placeholder="Temp password (6+)" value={form.owner_password} onChange={(e) => setForm((f) => ({ ...f, owner_password: e.target.value }))} />
          </div>
          {msg && <p className="mt-2 text-sm font-semibold text-rose-deep">{msg}</p>}
          <button disabled={creating} className="btn-primary mt-3 w-full rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-60">{creating ? "Creating…" : "Create business"}</button>
        </form>

        <div className={card + " p-0"}>
          <div className="border-b border-line px-5 py-3"><b className="text-sm">Businesses ({businesses.length})</b></div>
          <div className="max-h-[320px] overflow-y-auto">
            {businesses.length === 0 && <p className="px-5 py-6 text-sm text-ink-soft">No businesses yet. Add your first one.</p>}
            {businesses.map((b) => (
              <div key={b.id} className="border-b border-line px-5 py-3 last:border-0">
                <div className="flex items-center justify-between">
                  <div><b className="block text-sm">{b.business_name}</b><span className="text-xs text-ink-soft">{b.business_type}</span></div>
                </div>
                {origin && <a href={`${origin}/join/${b.id}`} target="_blank" rel="noreferrer" className="mt-1 block truncate text-xs font-semibold text-rose-deep">{origin}/join/{b.id}</a>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Analytics ── */}
      {stats && (
        <>
          <h2 className="mt-9 font-serif text-lg font-bold">Platform analytics</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {([["Shops", stats.totals.businesses], ["VIP members", stats.totals.members.toLocaleString()], ["Returning rate", stats.totals.returning_rate + "%"], ["Visits tracked", stats.totals.visits.toLocaleString()], ["New this month", stats.totals.new_this_month.toLocaleString()], ["Messages sent", stats.totals.messages.toLocaleString()]] as [string, string | number][]).map(([label, val]) => (
              <div key={label} className="card-shadow rounded-2xl border border-line bg-white p-4 lift">
                <div className="text-2xl font-bold text-rose-deep">{val}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-serif text-base font-bold">Shops &amp; their progress</h3>
            <div className="flex gap-2 text-xs">
              {([["returning", "Returning rate"], ["members", "Members"], ["visits", "Visits"]] as [Sort, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setSort(id)} className={"rounded-full border px-3 py-1.5 font-bold " + (sort === id ? "border-rose-deep bg-rose-deep text-white" : "border-line bg-white text-ink-soft")}>{label}</button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {shops.map((s, i) => (
              <div key={s.business_id} className="card-shadow rounded-2xl border border-line bg-white p-4 lift">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-sm font-bold text-white">{s.business_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</div>
                    <div><b className="block leading-tight">{s.business_name}</b><span className="text-xs text-ink-soft">{s.business_type}</span></div>
                  </div>
                  {i === 0 && sort === "returning" && <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-bold text-[#7a5e1d]">Top</span>}
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs"><span className="font-semibold text-ink-soft">Returning customer rate</span><b className="text-rose-deep">{s.returning_rate}%</b></div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#EFE4E1]"><div className="h-full rounded-full" style={{ width: `${s.returning_rate}%`, background: "linear-gradient(90deg,#B76E79,#7A3E48)" }} /></div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {[["Members", s.members.toLocaleString()], ["Visits", s.visits.toLocaleString()], ["Ready", s.rewards_ready], ["Inactive", s.inactive]].map(([l, v]) => (
                    <div key={l} className="rounded-xl bg-cream py-2"><div className="text-sm font-bold">{v}</div><div className="text-[10px] font-semibold uppercase text-ink-soft">{l}</div></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
