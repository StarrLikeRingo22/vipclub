"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Business, Customer, Service, Booking } from "@/lib/types";
import { Crest } from "@/components/Crest";
import { Scanner } from "@/components/Scanner";
import {
  HomeIcon, CalendarIcon, ScanIcon, MembersIcon, MessageIcon, CheckIcon,
} from "@/components/Icons";
import { ServicePicker, toggleInSet } from "@/components/ServicePicker";

type Tab = "home" | "bookings" | "scan" | "members" | "message";
interface BizData { business: Business; customers: Customer[]; services: Service[]; }

const TABS: { id: Tab; label: string; Icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "bookings", label: "Bookings", Icon: CalendarIcon },
  { id: "scan", label: "Scan", Icon: ScanIcon },
  { id: "members", label: "Members", Icon: MembersIcon },
  { id: "message", label: "Message", Icon: MessageIcon },
];

export function OwnerApp({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("home");
  const [data, setData] = useState<BizData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    const [b, bk] = await Promise.all([
      fetch(`/api/businesses/${businessId}`).then((r) => r.json()),
      fetch(`/api/businesses/${businessId}/bookings`).then((r) => r.json()),
    ]);
    setData(b);
    setBookings(bk.bookings ?? []);
  }, [businessId]);

  useEffect(() => { load(); }, [load]);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3200); };

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!data) {
    return <main className="flex min-h-screen items-center justify-center text-ink-soft">Loading your dashboard...</main>;
  }
  const services = data.services;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-0 py-0 sm:px-4 sm:py-8">
      <div className="phone">
        <div className="screen relative flex min-h-[100dvh] flex-col sm:min-h-[820px]">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white/90 px-5 pb-3 pt-5 backdrop-blur">
            <div className="flex items-center gap-2">
              <Crest size={34} />
              <div>
                <p className="text-xs text-ink-soft">{data.business.business_name}</p>
                <h1 className="font-serif text-lg font-bold">VIP Club</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/owner/settings" className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink-soft">Settings</Link>
              <button onClick={logout} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink-soft">Sign out</button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
            {tab === "home" && <Home data={data} bookings={bookings} go={setTab} />}
            {tab === "scan" && <Scanner members={data.customers} />}
            {tab === "members" && <Members customers={data.customers} threshold={data.business.reward_threshold} />}
            {tab === "bookings" && (
              <Bookings
                bookings={bookings}
                services={services}
                customers={data.customers}
                businessId={businessId}
                onChanged={(m) => { flash(m); load(); }}
                onDone={async (bookingId, serviceIds) => {
                  const res = await fetch(`/api/bookings/${bookingId}/complete`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ service_ids: serviceIds }),
                  });
                  const d = await res.json();
                  if (res.ok) {
                    flash(`${d.booking.customer_name} checked out - $${d.amount} logged` + (d.visit?.rewardJustEarned ? " - reward unlocked" : ""));
                    await load();
                  } else { flash(d.error || "Something went wrong"); }
                }}
              />
            )}
            {tab === "message" && (
              <Messaging businessId={businessId} onSent={(r) => flash(`Sent to ${r.sent} member${r.sent === 1 ? "" : "s"}`)} />
            )}
          </div>

          <nav className="sticky bottom-0 z-20 flex h-[68px] flex-shrink-0 border-t border-line bg-white">
            {TABS.map(({ id, label, Icon }) => {
              const active = tab === id;
              return (
                <button key={id} onClick={() => setTab(id)} aria-label={label} aria-current={active ? "page" : undefined}
                  className={"flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors " + (active ? "text-rose-deep" : "text-[#bda9ad]")}>
                  <Icon filled={active} width={24} height={24} />
                  {label}
                </button>
              );
            })}
          </nav>

          {toast && (
            <div className="absolute bottom-[84px] left-1/2 max-w-[320px] -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-center text-sm font-semibold text-white shadow-lg">{toast}</div>
          )}
        </div>
      </div>
    </main>
  );
}

function Home({ data, bookings, go }: { data: BizData; bookings: Booking[]; go: (t: Tab) => void }) {
  const ready = data.customers.filter((c) => c.reward_status === "ready").length;
  const visits = data.customers.reduce((a, c) => a + c.visit_count, 0);
  const todo = bookings.filter((b) => b.status === "scheduled").length;
  const needAttention = data.customers.filter((c) => c.status === "inactive").length;
  const stats = [
    ["VIP members", data.customers.length, "text-rose-deep"], ["Visits logged", visits, "text-gold"],
    ["Rewards ready", ready, "text-rose-deep"], ["Bookings today", bookings.length, "text-leaf"],
  ] as const;
  return (
    <div className="pt-1">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF6F0] px-3 py-1.5 text-[11px] font-bold text-[#3c7a62]">Synced - updated just now</div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(([label, val, color]) => (
          <div key={label} className="card-shadow rounded-2xl border border-line bg-white p-4">
            <div className={"text-2xl font-bold " + color}>{val}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
          </div>
        ))}
      </div>
      <button onClick={() => go("scan")} className="card-shadow mt-4 w-full rounded-2xl border-none p-4 text-left" style={{ background: "linear-gradient(135deg,#E9D9F0,#D7C2E8)" }}>
        <div className="flex items-center justify-between"><div><span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold" style={{ color: "#7a5290" }}>Fast check-in</span><p className="mt-2 text-base font-extrabold">Scan a member&apos;s pass</p></div><ScanIcon width={30} height={30} style={{ color: "#7a5290" }} /></div>
      </button>
      <button onClick={() => go("bookings")} className="card-shadow mt-3 w-full rounded-2xl border-none p-4 text-left" style={{ background: "linear-gradient(135deg,#FCE3E7,#F6C9D1)" }}>
        <div className="flex items-center justify-between"><div><span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-rose-deep">Today</span><p className="mt-2 text-base font-extrabold">{todo} booking{todo === 1 ? "" : "s"} to complete</p></div><CalendarIcon width={30} height={30} className="text-rose-deep" /></div>
      </button>
      {needAttention > 0 && (
        <button onClick={() => go("message")} className="card-shadow mt-3 w-full rounded-2xl border-none p-4 text-left" style={{ background: "linear-gradient(135deg,#FBE9CE,#F6DBA8)" }}>
          <div className="flex items-center justify-between"><div><span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold" style={{ color: "#7a5e1d" }}>Win them back</span><p className="mt-2 text-base font-extrabold">{needAttention} haven&apos;t visited in 30+ days</p></div><MessageIcon width={30} height={30} style={{ color: "#7a5e1d" }} /></div>
        </button>
      )}
    </div>
  );
}

function Members({ customers, threshold }: { customers: Customer[]; threshold: number }) {
  const [q, setQ] = useState("");
  const list = customers.filter((c) => c.full_name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="pt-1">
      <h2 className="mb-3 font-serif text-xl font-bold">Members</h2>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members..."
        className="card-shadow mb-3 w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px]" />
      <div className="card-shadow rounded-2xl border border-line bg-white px-4">
        {list.slice(0, 40).map((c) => (
          <a key={c.id} href={`/owner/client/${c.id}`} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#E8A0A8,#C97B86)" }}>
              {c.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1"><b className="block text-[15px]">{c.full_name}</b><span className="text-xs text-ink-soft">{c.points_balance}/{threshold} visits - {c.status}</span></div>
            {c.reward_status === "ready" && (<span className="rounded-full bg-[#D9EDE4] px-2.5 py-1 text-[11px] font-bold text-[#3c7a62]">Reward ready</span>)}
          </a>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-ink-soft">Tap a member to manage their profile, notes and history.</p>
    </div>
  );
}

function Bookings({
  bookings, services, customers, businessId, onDone, onChanged,
}: {
  bookings: Booking[]; services: Service[]; customers: Customer[]; businessId: string;
  onDone: (bookingId: string, serviceIds: string[]) => void;
  onChanged: (msg: string) => void;
}) {
  const [active, setActive] = useState<Booking | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [manage, setManage] = useState<Booking | null>(null);
  const [scheduling, setScheduling] = useState(false);

  const svcList = useCallback(
    (csv: string) => csv.split(",").map((id) => services.find((s) => s.id === id)).filter((s): s is Service => Boolean(s)),
    [services],
  );
  const priceOf = (csv: string) => svcList(csv).reduce((a, s) => a + s.price, 0);
  const namesOf = (csv: string) => svcList(csv).map((s) => s.name).join(", ") || "Service";

  const done = bookings.filter((b) => b.status === "done").length;
  const total = bookings.filter((b) => b.status === "done").reduce((a, b) => a + priceOf(b.service_id), 0);

  const openComplete = (b: Booking) => {
    setActive(b);
    setSelected(new Set(b.service_id.split(",").filter(Boolean)));
  };
  const toggle = (id: string) => setSelected((prev) => toggleInSet(prev, id));
  const selectedTotal = [...selected].reduce((a, id) => a + (services.find((s) => s.id === id)?.price ?? 0), 0);

  return (
    <div className="pt-1">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold">Bookings</h2>
        <button onClick={() => setScheduling(true)} className="btn-gold rounded-xl px-3 py-2 text-xs font-bold">+ Schedule</button>
      </div>
      <p className="mb-3 mt-1 text-sm text-ink-soft">Tap a row to reschedule or cancel. Check out to log the visit.</p>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[["Booked", bookings.length, "text-rose-deep"], ["Done", done, "text-leaf"], ["Logged", "$" + total, "text-gold"]].map(([l, v, c]) => (
          <div key={l} className="card-shadow rounded-xl border border-line bg-white p-3 text-center"><div className={"text-xl font-bold " + c}>{v}</div><div className="text-[10px] font-semibold uppercase text-ink-soft">{l}</div></div>
        ))}
      </div>
      <div className="card-shadow rounded-2xl border border-line bg-white px-4">
        {bookings.map((b) => {
          const cancelled = b.status === "cancelled";
          return (
            <div key={b.id} className={"flex items-center gap-3 border-b border-line py-3 last:border-0 " + (b.status !== "scheduled" ? "opacity-60" : "")}>
              <button onClick={() => b.status === "scheduled" && setManage(b)} className="flex flex-1 items-center gap-3 text-left">
                <div className="w-[54px] text-xs font-bold text-rose-deep">{b.time_label}</div>
                <div className="flex-1">
                  <b className="block text-[14px]">{b.customer_name}</b>
                  <span className="text-xs text-ink-soft">{namesOf(b.service_id)} - ${priceOf(b.service_id)}{cancelled ? " - cancelled" : ""}</span>
                </div>
              </button>
              {b.status === "done"
                ? (<span className="inline-flex items-center gap-1 text-xs font-bold text-leaf"><CheckIcon width={14} height={14} /> ${priceOf(b.service_id)}</span>)
                : cancelled
                  ? (<span className="text-xs font-bold text-ink-soft">Cancelled</span>)
                  : (<button onClick={() => openComplete(b)} className="btn-primary rounded-xl px-3.5 py-2 text-xs font-bold">Check out</button>)}
            </div>
          );
        })}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-2" onClick={(e) => { if (e.target === e.currentTarget) setActive(null); }}>
          <div className="w-full max-w-[460px] rounded-t-3xl bg-white p-5 pb-6">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#E5D5D8]" />
            <h3 className="font-serif text-xl font-bold">Check out</h3>
            <p className="mb-3 text-sm text-ink-soft">{active.customer_name} - {active.time_label} - select every service performed.</p>
            <ServicePicker services={services} selected={selected} toggle={toggle} />
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3"><span className="font-bold">Amount logged</span><b className="text-2xl text-rose-deep">${selectedTotal}</b></div>
            <button disabled={selected.size === 0} onClick={() => { onDone(active.id, [...selected]); setActive(null); }} className="btn-primary mt-4 w-full rounded-2xl px-4 py-4 text-base font-bold disabled:opacity-50">Confirm &amp; log visit</button>
          </div>
        </div>
      )}

      {manage && (
        <ManageModal booking={manage} onClose={() => setManage(null)}
          onChanged={(m) => { setManage(null); onChanged(m); }} />
      )}

      {scheduling && (
        <ScheduleModal businessId={businessId} customers={customers} services={services}
          onClose={() => setScheduling(false)}
          onScheduled={(m) => { setScheduling(false); onChanged(m); }} />
      )}
    </div>
  );
}

function ManageModal({ booking, onClose, onChanged }: { booking: Booking; onClose: () => void; onChanged: (msg: string) => void }) {
  const [mode, setMode] = useState<"menu" | "reschedule">("menu");
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function reschedule() {
    setErr(""); if (!when) { setErr("Pick a new date and time."); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starts_at: new Date(when).toISOString() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      onChanged(`Rescheduled - updated invite sent (${d.notify?.emailStatus ?? "email"})`);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); setBusy(false); }
  }
  async function cancel(noShow: boolean) {
    setBusy(true);
    try {
      const qs = noShow ? "?no_show=1" : "?reason=Cancelled%20by%20salon";
      const res = await fetch(`/api/bookings/${booking.id}${qs}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      onChanged(noShow ? "Marked as no-show" : "Cancelled - customer notified");
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); setBusy(false); }
  }

  const sel = "w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-3 text-[15px]";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-2" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[460px] rounded-t-3xl bg-white p-5 pb-6">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#E5D5D8]" />
        <h3 className="font-serif text-xl font-bold">{booking.customer_name}</h3>
        <p className="mb-4 text-sm text-ink-soft">{booking.time_label}</p>
        {err && <p className="mb-2 text-sm font-semibold text-rose-deep">{err}</p>}
        {mode === "menu" ? (
          <div className="space-y-2">
            <button onClick={() => setMode("reschedule")} className="btn-primary w-full rounded-2xl px-4 py-3.5 text-sm font-bold">Reschedule</button>
            <button onClick={() => cancel(false)} disabled={busy} className="w-full rounded-2xl border-[1.5px] border-rose-soft bg-white px-4 py-3.5 text-sm font-bold text-rose-deep disabled:opacity-60">Cancel booking</button>
            <button onClick={() => cancel(true)} disabled={busy} className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold text-ink-soft disabled:opacity-60">Mark no-show</button>
            <button onClick={onClose} className="w-full rounded-2xl px-4 py-2 text-sm font-bold text-ink-soft">Close</button>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-ink-soft">New date and time</label>
            <input type="datetime-local" className={sel} value={when} onChange={(e) => setWhen(e.target.value)} />
            <button onClick={reschedule} disabled={busy} className="btn-primary mt-4 w-full rounded-2xl px-4 py-3.5 text-base font-bold disabled:opacity-60">{busy ? "Updating..." : "Confirm reschedule & email invite"}</button>
            <button onClick={() => setMode("menu")} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink-soft">Back</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleModal({ businessId, customers, services, onClose, onScheduled }: {
  businessId: string; customers: Customer[]; services: Service[];
  onClose: () => void; onScheduled: (msg: string) => void;
}) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [when, setWhen] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const toggle = (id: string) => setSelected((prev) => toggleInSet(prev, id));
  const chosen = services.filter((s) => selected.has(s.id));
  const totalPrice = chosen.reduce((a, s) => a + s.price, 0);
  const totalMin = chosen.reduce((a, s) => a + s.duration_min, 0);

  async function submit() {
    setErr("");
    if (!customerId || selected.size === 0 || !when) { setErr("Pick a client, at least one service and a time."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, customer_id: customerId, service_ids: [...selected], starts_at: new Date(when).toISOString() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      const note = d.email?.status === "sent" ? "invite emailed" : d.email?.status === "mock" ? "invite ready (email mock)" : "booked";
      onScheduled(`Scheduled - ${note}`);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); setBusy(false); }
  }

  const sel = "w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-3 text-[15px]";
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-2" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-[460px] rounded-t-3xl bg-white p-5 pb-6">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#E5D5D8]" />
        <h3 className="font-serif text-xl font-bold">Schedule appointment</h3>
        <p className="mb-3 text-sm text-ink-soft">Pick one or more services. We&apos;ll email the client an invite with calendar links.</p>
        <label className="mb-1 block text-xs font-bold uppercase text-ink-soft">Client</label>
        <select className={sel + " mb-3"} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <label className="mb-1 block text-xs font-bold uppercase text-ink-soft">Services</label>
        <ServicePicker services={services} selected={selected} toggle={toggle} />
        {selected.size > 0 && (
          <div className="mt-2 flex items-center justify-between rounded-xl bg-blush px-3 py-2 text-sm">
            <span className="font-semibold text-ink-soft">{selected.size} selected - {totalMin} min</span>
            <b className="text-rose-deep">${totalPrice}</b>
          </div>
        )}
        <label className="mb-1 mt-3 block text-xs font-bold uppercase text-ink-soft">Date and time</label>
        <input type="datetime-local" className={sel} value={when} onChange={(e) => setWhen(e.target.value)} />
        {err && <p className="mt-2 text-sm font-semibold text-rose-deep">{err}</p>}
        <button onClick={submit} disabled={busy} className="btn-primary mt-4 w-full rounded-2xl px-4 py-4 text-base font-bold disabled:opacity-60">{busy ? "Scheduling..." : "Schedule & email invite"}</button>
        <button onClick={onClose} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink-soft">Cancel</button>
      </div>
    </div>
  );
}

function Messaging({ businessId, onSent }: { businessId: string; onSent: (r: { sent: number }) => void }) {
  const [audience, setAudience] = useState("all");
  const [msg, setMsg] = useState("VIP offer this week: 20% off your next service. A few spots just opened - reply to book!");
  const [busy, setBusy] = useState(false);
  const segments = [["all", "All VIP members"], ["inactive", "Inactive 30+ days"], ["reward", "Close to a reward"]] as const;

  async function send() {
    setBusy(true);
    try {
      const res = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_id: businessId, audience, message: msg }) });
      const d = await res.json();
      if (res.ok) onSent(d);
    } finally { setBusy(false); }
  }

  return (
    <div className="pt-1">
      <h2 className="font-serif text-xl font-bold">Send a message</h2>
      <p className="mb-3 mt-1 text-sm text-ink-soft">Pick who, write it once, send.</p>
      <div className="card-shadow mb-4 rounded-2xl border border-line bg-white p-2">
        {segments.map(([id, label]) => (
          <button key={id} onClick={() => setAudience(id)} className={"flex w-full items-center gap-3 rounded-xl border-[1.5px] p-3 text-left " + (audience === id ? "border-rose-soft bg-[#FFF5F6]" : "border-transparent")}>
            <b className="flex-1 text-sm">{label}</b><span className="text-rose-deep">{audience === id ? "*" : "o"}</span>
          </button>
        ))}
      </div>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="card-shadow h-24 w-full rounded-2xl border border-line bg-white p-3 text-sm" />
      <button onClick={send} disabled={busy} className="btn-gold mt-4 w-full rounded-2xl px-4 py-4 text-base font-bold disabled:opacity-60">{busy ? "Sending..." : "Send message"}</button>
      <p className="mt-3 text-center text-xs text-ink-soft">Adds a STOP opt-out automatically. Sends via Twilio when configured, otherwise logged.</p>
    </div>
  );
}
