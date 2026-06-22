"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Business, Customer, Service, Booking } from "@/lib/types";
import { Crest } from "@/components/Crest";
import { Scanner } from "@/components/Scanner";
import { ServicePicker, toggleInSet } from "@/components/ServicePicker";
import {
  HomeIcon, CalendarIcon, MembersIcon, MessageIcon, CheckIcon, ListIcon,
  GiftIcon, ShareIcon, ChartIcon, CogIcon, PlusIcon, ScanIcon,
} from "@/components/Icons";

type Section =
  | "dashboard" | "calendar" | "clients" | "appointments" | "messages"
  | "rewards" | "referrals" | "analytics" | "staff" | "settings";

interface Metrics { messagesSent: number; visitsLogged: number; revenueLogged: number; referrals: number; }
interface BizData { business: Business; customers: Customer[]; services: Service[]; metrics: Metrics; }

const NAV: { id: Section; label: string; Icon: typeof HomeIcon }[] = [
  { id: "dashboard", label: "Dashboard", Icon: HomeIcon },
  { id: "calendar", label: "Calendar", Icon: CalendarIcon },
  { id: "clients", label: "Clients", Icon: MembersIcon },
  { id: "appointments", label: "Appointments", Icon: ListIcon },
  { id: "messages", label: "Messages", Icon: MessageIcon },
  { id: "rewards", label: "Rewards", Icon: GiftIcon },
  { id: "referrals", label: "Referrals", Icon: ShareIcon },
  { id: "analytics", label: "Analytics", Icon: ChartIcon },
  { id: "staff", label: "Staff", Icon: MembersIcon },
  { id: "settings", label: "Settings", Icon: CogIcon },
];

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}
function sameMonth(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso); const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}
const money = (n: number) => "$" + n.toLocaleString();

export function OwnerApp({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [section, setSection] = useState<Section>("dashboard");
  const [data, setData] = useState<BizData | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [toast, setToast] = useState("");
  const [scanning, setScanning] = useState(false);

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
    return <main className="flex min-h-screen items-center justify-center text-ink-soft">Loading your dashboard…</main>;
  }
  const { business, customers, services, metrics } = data;
  const reminderDays = business.default_reminder_days;

  const Nav = ({ onPick }: { onPick?: () => void }) => (
    <>
      {NAV.map(({ id, label, Icon }) => {
        const active = section === id;
        return (
          <button key={id} onClick={() => { setSection(id); onPick?.(); }}
            className={"flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors " +
              (active ? "bg-rose-soft/60 text-rose-deep" : "text-ink-soft hover:bg-cream")}>
            <Icon filled={active} width={20} height={20} />
            <span>{label}</span>
          </button>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col border-r border-line bg-white px-3 py-5 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <Crest size={32} />
          <div>
            <p className="font-serif text-base font-bold leading-tight">VIP Club</p>
            <p className="text-[11px] text-ink-soft">{business.business_name}</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1"><Nav /></nav>
        <button onClick={logout} className="mt-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink-soft hover:bg-cream">Sign out</button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Crest size={26} />
            <span className="font-serif font-bold">VIP Club</span>
          </div>
          <h1 className="hidden text-lg font-bold capitalize lg:block">{section}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setScanning(true)} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink-soft">
              <ScanIcon width={16} height={16} /> Check in
            </button>
            <Link href="/owner/settings" className="hidden rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink-soft sm:block">Settings</Link>
            <button onClick={logout} className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink-soft lg:hidden">Sign out</button>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="sticky top-[57px] z-10 flex gap-1 overflow-x-auto border-b border-line bg-white px-3 py-2 lg:hidden">
          <Nav />
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {section === "dashboard" && <Dashboard data={data} bookings={bookings} reminderDays={reminderDays} go={setSection} />}
          {section === "calendar" && <CalendarAgenda bookings={bookings} services={services} customers={customers} businessId={businessId} onChanged={(m) => { flash(m); load(); }} />}
          {section === "clients" && <Clients customers={customers} businessId={businessId} threshold={business.reward_threshold} onChanged={(m) => { flash(m); load(); }} />}
          {section === "appointments" && (
            <Appointments bookings={bookings} services={services} customers={customers} businessId={businessId}
              onChanged={(m) => { flash(m); load(); }}
              onDone={async (bookingId, serviceIds) => {
                const res = await fetch(`/api/bookings/${bookingId}/complete`, {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ service_ids: serviceIds }),
                });
                const d = await res.json();
                if (res.ok) { flash(`${d.booking.customer_name} checked out · ${money(d.amount)} logged` + (d.visit?.rewardJustEarned ? " · reward unlocked" : "")); await load(); }
                else flash(d.error || "Something went wrong");
              }} />
          )}
          {section === "messages" && <Messages businessId={businessId} businessName={business.business_name} onSent={(n) => flash(`Sent to ${n} client${n === 1 ? "" : "s"}`)} />}
          {section === "rewards" && <Rewards customers={customers} threshold={business.reward_threshold} />}
          {section === "referrals" && <Referrals customers={customers} />}
          {section === "analytics" && <Analytics customers={customers} bookings={bookings} services={services} metrics={metrics} reminderDays={reminderDays} />}
          {section === "staff" && <StaffSection />}
          {section === "settings" && <SettingsSection business={business} />}
        </main>
      </div>

      {scanning && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setScanning(false); }}>
          <div className="mt-6 w-full max-w-md rounded-3xl bg-cream p-5">
            <div className="mb-3 flex items-center justify-between">
              <b className="font-serif text-lg">Check in a client</b>
              <button onClick={() => setScanning(false)} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-ink-soft">Close</button>
            </div>
            <Scanner members={customers} />
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 max-w-[340px] -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-center text-sm font-semibold text-white shadow-lg">{toast}</div>
      )}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────
function Dashboard({ data, bookings, reminderDays, go }: { data: BizData; bookings: Booking[]; reminderDays: number; go: (s: Section) => void }) {
  const { customers, services, metrics } = data;
  const svc = (csv: string) => csv.split(",").map((id) => services.find((s) => s.id === id)).filter(Boolean) as Service[];
  const active = customers.filter((c) => c.status === "active").length;
  const inactive = customers.filter((c) => c.status === "inactive").length;
  const returningRate = customers.length ? Math.round(customers.filter((c) => c.visit_count >= 2).length / customers.length * 100) : 0;
  const due = customers.filter((c) => { const d = daysSince(c.last_visit_date); return c.status !== "unsubscribed" && d !== null && d >= reminderDays; }).length;
  const rewardsReady = customers.filter((c) => c.reward_status === "ready").length;
  const rewardsRedeemed = customers.filter((c) => c.reward_status === "redeemed").length;
  const apptThisMonth = bookings.filter((b) => sameMonth(b.starts_at ?? b.created_at)).length;
  const doneRevenue = bookings.filter((b) => b.status === "done").reduce((a, b) => a + svc(b.service_id).reduce((x, s) => x + s.price, 0), 0);
  const revenue = metrics.revenueLogged || doneRevenue;
  const referrals = metrics.referrals || customers.filter((c) => c.referred_by).length;
  const topClients = [...customers].sort((a, b) => b.visit_count - a.visit_count).slice(0, 6);
  const dueList = customers.filter((c) => { const d = daysSince(c.last_visit_date); return c.status !== "unsubscribed" && d !== null && d >= reminderDays; }).slice(0, 6);

  const cards: [string, string | number][] = [
    ["Active clients", active],
    ["Appointments this month", apptThisMonth],
    ["Returning client rate", returningRate + "%"],
    ["Clients due for follow-up", due],
    ["Messages sent", metrics.messagesSent],
    ["Rewards redeemed", rewardsRedeemed],
    ["Referrals generated", referrals],
    ["Revenue influenced", money(revenue)],
    ["Rewards ready", rewardsReady],
    ["Inactive clients", inactive],
  ];

  return (
    <div>
      <SectionHead title="Dashboard" subtitle={`Welcome back — here's how ${data.business.business_name} is performing.`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(([label, val]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4">
            <div className="text-2xl font-bold text-ink">{val}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <QuickAction onClick={() => go("clients")} label="Add client" />
        <QuickAction onClick={() => go("appointments")} label="New appointment" />
        <QuickAction onClick={() => go("messages")} label="Send message" />
        <QuickAction onClick={() => go("staff")} label="Add staff" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Clients due for follow-up" action={<button onClick={() => go("messages")} className="text-xs font-bold text-rose-deep">Send campaign</button>}>
          {dueList.length === 0 && <Empty>No clients are overdue right now.</Empty>}
          {dueList.map((c) => (
            <Row key={c.id} href={`/owner/client/${c.id}`} name={c.full_name} meta={`Last visit ${daysSince(c.last_visit_date)}d ago`} tag="Due" />
          ))}
        </Panel>
        <Panel title="Top clients" action={<button onClick={() => go("clients")} className="text-xs font-bold text-rose-deep">View all</button>}>
          {topClients.map((c) => (
            <Row key={c.id} href={`/owner/client/${c.id}`} name={c.full_name} meta={`${c.visit_count} visits · ${c.status}`} tag={c.reward_status === "ready" ? "Reward" : undefined} />
          ))}
        </Panel>
      </div>
    </div>
  );
}

// ── Calendar (agenda) ───────────────────────────────────────────
function CalendarAgenda({ bookings, services, customers, businessId, onChanged }: {
  bookings: Booking[]; services: Service[]; customers: Customer[]; businessId: string; onChanged: (m: string) => void;
}) {
  const [scheduling, setScheduling] = useState(false);
  const svc = (csv: string) => csv.split(",").map((id) => services.find((s) => s.id === id)).filter(Boolean) as Service[];
  const scheduled = bookings.filter((b) => b.status === "scheduled");
  const groups = new Map<string, Booking[]>();
  for (const b of scheduled) {
    const key = b.starts_at ? new Date(b.starts_at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) : "Today";
    groups.set(key, [...(groups.get(key) ?? []), b]);
  }
  return (
    <div>
      <SectionHead title="Calendar" subtitle="Manage appointments and follow-ups from one place." action={<PrimaryBtn onClick={() => setScheduling(true)}>New appointment</PrimaryBtn>} />
      {groups.size === 0 && <Empty>No upcoming appointments. Schedule one to get started.</Empty>}
      <div className="space-y-5">
        {[...groups.entries()].map(([day, items]) => (
          <div key={day}>
            <p className="mb-2 text-sm font-bold text-ink-soft">{day}</p>
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              {items.map((b) => (
                <div key={b.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                  <div className="w-20 text-xs font-bold text-rose-deep">{b.starts_at ? new Date(b.starts_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : b.time_label}</div>
                  <div className="flex-1">
                    <b className="block text-sm">{b.customer_name}</b>
                    <span className="text-xs text-ink-soft">{svc(b.service_id).map((s) => s.name).join(", ") || "Appointment"}</span>
                  </div>
                  <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-bold text-ink-soft">{b.duration_min ?? 45} min</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {scheduling && <ScheduleModal businessId={businessId} customers={customers} services={services} onClose={() => setScheduling(false)} onScheduled={(m) => { setScheduling(false); onChanged(m); }} />}
    </div>
  );
}

// ── Clients ─────────────────────────────────────────────────────
function Clients({ customers, businessId, threshold, onChanged }: { customers: Customer[]; businessId: string; threshold: number; onChanged: (m: string) => void }) {
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const list = customers.filter((c) => c.full_name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));
  return (
    <div>
      <SectionHead title="Clients" subtitle={`${customers.length} total clients`} action={<PrimaryBtn onClick={() => setAdding(true)}>Add client</PrimaryBtn>} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or phone…"
        className="mb-3 w-full max-w-md rounded-xl border border-line bg-white px-4 py-2.5 text-[15px]" />
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {list.slice(0, 60).map((c) => (
          <a key={c.id} href={`/owner/client/${c.id}`} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-cream">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#E8A0A8,#C97B86)" }}>
              {c.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1"><b className="block text-sm">{c.full_name}</b><span className="text-xs text-ink-soft">{c.phone} · {c.points_balance}/{threshold} · {c.status}</span></div>
            {c.reward_status === "ready" && <span className="rounded-full bg-[#D9EDE4] px-2.5 py-1 text-[11px] font-bold text-[#3c7a62]">Reward ready</span>}
          </a>
        ))}
        {list.length === 0 && <Empty>No clients match your search.</Empty>}
      </div>
      {adding && <AddClientModal businessId={businessId} onClose={() => setAdding(false)} onAdded={(m) => { setAdding(false); onChanged(m); }} />}
    </div>
  );
}

function AddClientModal({ businessId, onClose, onAdded }: { businessId: string; onClose: () => void; onAdded: (m: string) => void }) {
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", consent_sms: true });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const field = "w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-[15px]";
  async function submit() {
    setErr(""); if (!form.full_name || !form.phone) { setErr("Name and phone are required."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_id: businessId, ...form }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      onAdded(d.existing ? "Client already exists" : "Client added");
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); setBusy(false); }
  }
  return (
    <Modal onClose={onClose} title="Add client">
      <input className={field + " mb-2"} placeholder="Full name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
      <input className={field + " mb-2"} placeholder="Mobile number" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      <input className={field + " mb-2"} placeholder="Email (optional)" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      <label className="mb-3 flex items-center gap-2 text-sm text-ink-soft"><input type="checkbox" className="h-4 w-4 accent-rose-deep" checked={form.consent_sms} onChange={(e) => setForm((f) => ({ ...f, consent_sms: e.target.checked }))} /> Client consents to SMS</label>
      {err && <p className="mb-2 text-sm font-semibold text-rose-deep">{err}</p>}
      <PrimaryBtn full onClick={submit} disabled={busy}>{busy ? "Adding…" : "Add client"}</PrimaryBtn>
    </Modal>
  );
}

// ── Appointments (manage + checkout) ────────────────────────────
function Appointments({ bookings, services, customers, businessId, onDone, onChanged }: {
  bookings: Booking[]; services: Service[]; customers: Customer[]; businessId: string;
  onDone: (id: string, ids: string[]) => void; onChanged: (m: string) => void;
}) {
  const [active, setActive] = useState<Booking | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [manage, setManage] = useState<Booking | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const svc = (csv: string) => csv.split(",").map((id) => services.find((s) => s.id === id)).filter(Boolean) as Service[];
  const priceOf = (csv: string) => svc(csv).reduce((a, s) => a + s.price, 0);
  const namesOf = (csv: string) => svc(csv).map((s) => s.name).join(", ") || "Service";
  const done = bookings.filter((b) => b.status === "done").length;
  const total = bookings.filter((b) => b.status === "done").reduce((a, b) => a + priceOf(b.service_id), 0);
  const openComplete = (b: Booking) => { setActive(b); setSelected(new Set(b.service_id.split(",").filter(Boolean))); };
  const toggle = (id: string) => setSelected((p) => toggleInSet(p, id));
  const selectedTotal = [...selected].reduce((a, id) => a + (services.find((s) => s.id === id)?.price ?? 0), 0);

  return (
    <div>
      <SectionHead title="Appointments" subtitle="Tap a row to reschedule or cancel. Check out to log the visit." action={<PrimaryBtn onClick={() => setScheduling(true)}>New appointment</PrimaryBtn>} />
      <div className="mb-4 grid grid-cols-3 gap-3 sm:max-w-md">
        {[["Booked", bookings.length], ["Completed", done], ["Logged", money(total)]].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-line bg-white p-3 text-center"><div className="text-xl font-bold text-ink">{v}</div><div className="text-[10px] font-semibold uppercase text-ink-soft">{l}</div></div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {bookings.map((b) => {
          const cancelled = b.status === "cancelled";
          return (
            <div key={b.id} className={"flex items-center gap-3 border-b border-line px-4 py-3 last:border-0 " + (b.status !== "scheduled" ? "opacity-60" : "")}>
              <button onClick={() => b.status === "scheduled" && setManage(b)} className="flex flex-1 items-center gap-3 text-left">
                <div className="w-16 text-xs font-bold text-rose-deep">{b.time_label}</div>
                <div className="flex-1"><b className="block text-sm">{b.customer_name}</b><span className="text-xs text-ink-soft">{namesOf(b.service_id)} · {money(priceOf(b.service_id))}{cancelled ? " · cancelled" : ""}</span></div>
              </button>
              {b.status === "done" ? <span className="inline-flex items-center gap-1 text-xs font-bold text-leaf"><CheckIcon width={14} height={14} /> {money(priceOf(b.service_id))}</span>
                : cancelled ? <span className="text-xs font-bold text-ink-soft">Cancelled</span>
                : <button onClick={() => openComplete(b)} className="btn-primary rounded-xl px-3.5 py-2 text-xs font-bold">Check out</button>}
            </div>
          );
        })}
        {bookings.length === 0 && <Empty>No appointments yet.</Empty>}
      </div>

      {active && (
        <Modal onClose={() => setActive(null)} title="Check out">
          <p className="mb-3 text-sm text-ink-soft">{active.customer_name} · {active.time_label} · select every service performed.</p>
          <ServicePicker services={services} selected={selected} toggle={toggle} />
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3"><span className="font-bold">Amount logged</span><b className="text-2xl text-rose-deep">{money(selectedTotal)}</b></div>
          <PrimaryBtn full disabled={selected.size === 0} onClick={() => { onDone(active.id, [...selected]); setActive(null); }}>Confirm &amp; log visit</PrimaryBtn>
        </Modal>
      )}
      {manage && <ManageModal booking={manage} onClose={() => setManage(null)} onChanged={(m) => { setManage(null); onChanged(m); }} />}
      {scheduling && <ScheduleModal businessId={businessId} customers={customers} services={services} onClose={() => setScheduling(false)} onScheduled={(m) => { setScheduling(false); onChanged(m); }} />}
    </div>
  );
}

function ManageModal({ booking, onClose, onChanged }: { booking: Booking; onClose: () => void; onChanged: (m: string) => void }) {
  const [mode, setMode] = useState<"menu" | "reschedule">("menu");
  const [when, setWhen] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function reschedule() {
    setErr(""); if (!when) { setErr("Pick a new date and time."); return; } setBusy(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ starts_at: new Date(when).toISOString() }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || "Failed");
      onChanged("Rescheduled — updated invite sent");
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); setBusy(false); }
  }
  async function cancel(noShow: boolean) {
    setBusy(true);
    try {
      const qs = noShow ? "?no_show=1" : "?reason=Cancelled%20by%20salon";
      const res = await fetch(`/api/bookings/${booking.id}${qs}`, { method: "DELETE" });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || "Failed");
      onChanged(noShow ? "Marked as no-show" : "Cancelled — client notified");
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); setBusy(false); }
  }
  const field = "w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-3 text-[15px]";
  return (
    <Modal onClose={onClose} title={booking.customer_name}>
      <p className="mb-4 text-sm text-ink-soft">{booking.time_label}</p>
      {err && <p className="mb-2 text-sm font-semibold text-rose-deep">{err}</p>}
      {mode === "menu" ? (
        <div className="space-y-2">
          <PrimaryBtn full onClick={() => setMode("reschedule")}>Reschedule</PrimaryBtn>
          <button onClick={() => cancel(false)} disabled={busy} className="w-full rounded-2xl border-[1.5px] border-rose-soft bg-white px-4 py-3 text-sm font-bold text-rose-deep disabled:opacity-60">Cancel booking</button>
          <button onClick={() => cancel(true)} disabled={busy} className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm font-bold text-ink-soft disabled:opacity-60">Mark no-show</button>
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-ink-soft">New date and time</label>
          <input type="datetime-local" className={field} value={when} onChange={(e) => setWhen(e.target.value)} />
          <PrimaryBtn full onClick={reschedule} disabled={busy}>{busy ? "Updating…" : "Confirm reschedule"}</PrimaryBtn>
          <button onClick={() => setMode("menu")} className="mt-2 w-full rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink-soft">Back</button>
        </div>
      )}
    </Modal>
  );
}

function ScheduleModal({ businessId, customers, services, onClose, onScheduled }: {
  businessId: string; customers: Customer[]; services: Service[]; onClose: () => void; onScheduled: (m: string) => void;
}) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [when, setWhen] = useState(""); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const toggle = (id: string) => setSelected((p) => toggleInSet(p, id));
  const chosen = services.filter((s) => selected.has(s.id));
  const totalPrice = chosen.reduce((a, s) => a + s.price, 0);
  const totalMin = chosen.reduce((a, s) => a + s.duration_min, 0);
  async function submit() {
    setErr(""); if (!customerId || selected.size === 0 || !when) { setErr("Pick a client, at least one service and a time."); return; } setBusy(true);
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_id: businessId, customer_id: customerId, service_ids: [...selected], starts_at: new Date(when).toISOString() }) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error || "Failed");
      onScheduled("Appointment scheduled");
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); setBusy(false); }
  }
  const field = "w-full rounded-xl border-[1.5px] border-line bg-white px-3 py-3 text-[15px]";
  return (
    <Modal onClose={onClose} title="New appointment">
      <label className="mb-1 block text-xs font-bold uppercase text-ink-soft">Client</label>
      <select className={field + " mb-3"} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
        {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
      </select>
      <label className="mb-1 block text-xs font-bold uppercase text-ink-soft">Services</label>
      <ServicePicker services={services} selected={selected} toggle={toggle} />
      {selected.size > 0 && <div className="mt-2 flex items-center justify-between rounded-xl bg-blush px-3 py-2 text-sm"><span className="font-semibold text-ink-soft">{selected.size} selected · {totalMin} min</span><b className="text-rose-deep">{money(totalPrice)}</b></div>}
      <label className="mb-1 mt-3 block text-xs font-bold uppercase text-ink-soft">Date and time</label>
      <input type="datetime-local" className={field} value={when} onChange={(e) => setWhen(e.target.value)} />
      {err && <p className="mt-2 text-sm font-semibold text-rose-deep">{err}</p>}
      <PrimaryBtn full onClick={submit} disabled={busy}>{busy ? "Scheduling…" : "Schedule & email invite"}</PrimaryBtn>
    </Modal>
  );
}

// ── Messages ────────────────────────────────────────────────────
const TEMPLATES: { id: string; label: string; audience: string; body: (s: string) => string }[] = [
  { id: "reminder", label: "Rebooking reminder", audience: "inactive", body: (s) => `Hi! It's been a while since your last visit to ${s}. Ready to rebook? Reply to grab a spot.` },
  { id: "reward", label: "Reward ready", audience: "reward", body: (s) => `Good news — you're close to a reward at ${s}. Book your next visit to redeem it.` },
  { id: "slowday", label: "Slow-day offer", audience: "all", body: (s) => `Midweek opening at ${s}: 15% off select services this week. Reply to book.` },
  { id: "reactivation", label: "Win-back", audience: "inactive", body: (s) => `We miss you at ${s}! Here's 20% off your next visit. Reply to schedule.` },
];

function Messages({ businessId, businessName, onSent }: { businessId: string; businessName: string; onSent: (n: number) => void }) {
  const [audience, setAudience] = useState("all");
  const [msg, setMsg] = useState(TEMPLATES[0].body(businessName));
  const [busy, setBusy] = useState(false);
  const segments = [["all", "All clients"], ["inactive", "Inactive 30+ days"], ["reward", "Close to a reward"]] as const;
  async function send() {
    setBusy(true);
    try {
      const res = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_id: businessId, audience, message: msg }) });
      const d = await res.json(); if (res.ok) onSent(d.sent ?? 0);
    } finally { setBusy(false); }
  }
  return (
    <div>
      <SectionHead title="Automated Client Communication" subtitle="Pick an audience, start from a template, and send." />
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Templates</p>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => { setAudience(t.audience); setMsg(t.body(businessName)); }} className="rounded-xl border border-line bg-white px-3 py-3 text-left text-sm font-semibold hover:bg-cream">{t.label}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Audience</p>
          <div className="mb-3 rounded-2xl border border-line bg-white p-2">
            {segments.map(([id, label]) => (
              <button key={id} onClick={() => setAudience(id)} className={"flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold " + (audience === id ? "bg-rose-soft/50 text-rose-deep" : "text-ink-soft")}>{label}<span>{audience === id ? "●" : "○"}</span></button>
            ))}
          </div>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="h-28 w-full rounded-2xl border border-line bg-white p-3 text-sm" />
          <PrimaryBtn full onClick={send} disabled={busy}>{busy ? "Sending…" : "Send message"}</PrimaryBtn>
          <p className="mt-2 text-center text-xs text-ink-soft">Adds a STOP opt-out automatically. Sends via Twilio when configured, otherwise logged.</p>
        </div>
      </div>
    </div>
  );
}

// ── Rewards ─────────────────────────────────────────────────────
function Rewards({ customers, threshold }: { customers: Customer[]; threshold: number }) {
  const ready = customers.filter((c) => c.reward_status === "ready");
  const earning = customers.filter((c) => c.reward_status === "earning").length;
  const redeemed = customers.filter((c) => c.reward_status === "redeemed").length;
  return (
    <div>
      <SectionHead title="Reward Progress" subtitle={`Clients earn a reward every ${threshold} visits.`} />
      <div className="mb-4 grid grid-cols-3 gap-3 sm:max-w-md">
        {[["Reward ready", ready.length], ["Earning", earning], ["Redeemed", redeemed]].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-line bg-white p-3 text-center"><div className="text-xl font-bold text-ink">{v}</div><div className="text-[10px] font-semibold uppercase text-ink-soft">{l}</div></div>
        ))}
      </div>
      <Panel title="Clients with a reward ready">
        {ready.length === 0 && <Empty>No rewards are ready to redeem.</Empty>}
        {ready.slice(0, 30).map((c) => <Row key={c.id} href={`/owner/client/${c.id}`} name={c.full_name} meta={`${c.points_balance}/${threshold} visits`} tag="Redeem" />)}
      </Panel>
    </div>
  );
}

// ── Referrals ───────────────────────────────────────────────────
function Referrals({ customers }: { customers: Customer[] }) {
  const referred = customers.filter((c) => c.referred_by).length;
  const top = [...customers].sort((a, b) => b.visit_count - a.visit_count).slice(0, 20);
  return (
    <div>
      <SectionHead title="Turn Clients Into Referrals" subtitle="Every client has a personal referral code to share." />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:max-w-sm">
        {[["Referring clients", customers.length], ["Referred clients", referred]].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-line bg-white p-3 text-center"><div className="text-xl font-bold text-ink">{v}</div><div className="text-[10px] font-semibold uppercase text-ink-soft">{l}</div></div>
        ))}
      </div>
      <Panel title="Referral codes">
        {top.map((c) => (
          <div key={c.id} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0">
            <div><b className="block text-sm">{c.full_name}</b><span className="text-xs text-ink-soft">{c.visit_count} visits</span></div>
            <span className="rounded-lg bg-blush px-2.5 py-1 text-sm font-extrabold text-rose-deep">{c.customer_code}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}

// ── Analytics ───────────────────────────────────────────────────
function Analytics({ customers, bookings, services, metrics, reminderDays }: {
  customers: Customer[]; bookings: Booking[]; services: Service[]; metrics: Metrics; reminderDays: number;
}) {
  const svc = (csv: string) => csv.split(",").map((id) => services.find((s) => s.id === id)).filter(Boolean) as Service[];
  const returningRate = customers.length ? Math.round(customers.filter((c) => c.visit_count >= 2).length / customers.length * 100) : 0;
  const avgVisits = customers.length ? Math.round(customers.reduce((a, c) => a + c.visit_count, 0) / customers.length * 10) / 10 : 0;
  const newThisMonth = customers.filter((c) => sameMonth(c.created_at)).length;
  const doneRevenue = bookings.filter((b) => b.status === "done").reduce((a, b) => a + svc(b.service_id).reduce((x, s) => x + s.price, 0), 0);
  const top = [...customers].sort((a, b) => b.visit_count - a.visit_count).slice(0, 8);
  const cards: [string, string | number][] = [
    ["Repeat visit rate", returningRate + "%"],
    ["Avg visits / client", avgVisits],
    ["Appointment volume", bookings.length],
    ["New clients this month", newThisMonth],
    ["Messages sent", metrics.messagesSent],
    ["Revenue influenced", money(metrics.revenueLogged || doneRevenue)],
  ];
  return (
    <div>
      <SectionHead title="Analytics" subtitle="Retention and growth at a glance." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-line bg-white p-4"><div className="text-2xl font-bold text-ink">{v}</div><div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{l}</div></div>
        ))}
      </div>
      <div className="mt-5">
        <Panel title="Most valuable clients">
          {top.map((c) => <Row key={c.id} href={`/owner/client/${c.id}`} name={c.full_name} meta={`${c.visit_count} visits · ${c.status}`} />)}
        </Panel>
      </div>
    </div>
  );
}

// ── Staff + Settings ────────────────────────────────────────────
function StaffSection() {
  return (
    <div>
      <SectionHead title="Staff" subtitle="Manage who can access this dashboard." action={<Link href="/owner/settings" className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">Manage staff</Link>} />
      <Panel title="Roles">
        <div className="px-4 py-3 text-sm text-ink-soft">Owners manage everything. Staff can check clients in, log visits, add notes, and apply rewards — but can't see billing, exports, or platform settings. Add and edit staff from Settings.</div>
      </Panel>
    </div>
  );
}

function SettingsSection({ business }: { business: Business }) {
  return (
    <div>
      <SectionHead title="Settings" subtitle="Business profile, services, staff, rewards and messaging." action={<Link href="/owner/settings" className="btn-primary rounded-xl px-4 py-2.5 text-sm font-bold">Open settings</Link>} />
      <Panel title={business.business_name}>
        <div className="space-y-2 px-4 py-3 text-sm">
          <div className="flex justify-between"><span className="text-ink-soft">Reward rule</span><b>{business.reward_threshold} visits = 1 reward</b></div>
          <div className="flex justify-between"><span className="text-ink-soft">Reminder timing</span><b>{business.default_reminder_days} days</b></div>
          <div className="flex justify-between"><span className="text-ink-soft">Booking link</span><b className="max-w-[200px] truncate">{business.booking_url || "—"}</b></div>
        </div>
      </Panel>
    </div>
  );
}

// ── Shared UI ───────────────────────────────────────────────────
function SectionHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-serif text-2xl font-bold">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-3"><b className="text-sm">{title}</b>{action}</div>
      <div>{children}</div>
    </div>
  );
}
function Row({ href, name, meta, tag }: { href: string; name: string; meta: string; tag?: string }) {
  return (
    <a href={href} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0 hover:bg-cream">
      <div><b className="block text-sm">{name}</b><span className="text-xs text-ink-soft">{meta}</span></div>
      {tag && <span className="rounded-full bg-rose-soft/60 px-2.5 py-1 text-[11px] font-bold text-rose-deep">{tag}</span>}
    </a>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-6 text-center text-sm text-ink-soft">{children}</p>;
}
function QuickAction({ onClick, label }: { onClick: () => void; label: string }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink-soft hover:bg-cream"><PlusIcon width={15} height={15} /> {label}</button>;
}
function PrimaryBtn({ children, onClick, disabled, full }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; full?: boolean }) {
  return <button onClick={onClick} disabled={disabled} className={"btn-primary rounded-2xl px-5 py-3 text-sm font-bold disabled:opacity-50 " + (full ? "mt-3 w-full" : "")}>{children}</button>;
}
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/45 p-0 sm:items-center sm:p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-6 sm:rounded-3xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-ink-soft">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
