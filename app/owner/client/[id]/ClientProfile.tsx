"use client";

import { useState } from "react";
import Link from "next/link";
import type { Customer, Visit } from "@/lib/types";
import { Crest } from "@/components/Crest";
import { RewardRing } from "@/components/RewardRing";

function daysAgo(iso: string | null): string {
  if (!iso) return "never";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d === 0 ? "today" : `${d}d ago`;
}

export function ClientProfile({
  customer: initial,
  visits: initialVisits,
  threshold,
  reminderDays,
}: {
  customer: Customer;
  visits: Visit[];
  threshold: number;
  reminderDays: number;
}) {
  const [customer, setCustomer] = useState(initial);
  const [visits] = useState(initialVisits);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [toast, setToast] = useState("");

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2400); };
  const dueIn = reminderDays - (customer.last_visit_date
    ? Math.floor((Date.now() - new Date(customer.last_visit_date).getTime()) / 86400000) : reminderDays);

  async function saveNotes() {
    const res = await fetch(`/api/clients/${customer.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) { setCustomer((c) => ({ ...c, notes })); flash("Notes saved."); }
  }
  async function setStatus(status: "active" | "inactive") {
    const res = await fetch(`/api/clients/${customer.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const d = await res.json();
    if (res.ok) { setCustomer(d.customer); flash(`Marked ${status}`); }
  }
  async function redeem() {
    const res = await fetch(`/api/customers/${customer.id}/redeem`, { method: "POST" });
    const d = await res.json();
    if (res.ok) { setCustomer(d.customer); flash("Reward redeemed."); }
    else flash(d.error || "Failed");
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/owner" className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-lg text-ink-soft">&larr;</Link>
          <div className="flex items-center gap-2"><Crest size={26} /><b>Client profile</b></div>
        </div>

        <div className="card-shadow rounded-3xl border border-line bg-white p-6 text-center"
          style={{ background: "linear-gradient(160deg,#FFFFFF,#FFF4F5)" }}>
          <h1 className="font-serif text-xl font-bold">{customer.full_name}</h1>
          <p className="text-sm text-ink-soft">
            {customer.phone}{customer.email ? ` · ${customer.email}` : ""}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            #{customer.customer_code} · joined {daysAgo(customer.created_at)} · last visit {daysAgo(customer.last_visit_date)}
          </p>
          <div className="mt-4"><RewardRing visits={customer.points_balance} threshold={threshold} rewardStatus={customer.reward_status} /></div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
            <div><b className="block text-lg text-rose-deep">{customer.visit_count}</b><span className="text-[10px] uppercase text-ink-soft">Visits</span></div>
            <div><b className="block text-lg text-gold">{dueIn <= 0 ? "Due" : `${dueIn}d`}</b><span className="text-[10px] uppercase text-ink-soft">Next due</span></div>
            <div><b className="block text-lg capitalize text-leaf">{customer.status}</b><span className="text-[10px] uppercase text-ink-soft">Status</span></div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href={`/checkin/${customer.id}`} className="btn-primary rounded-2xl px-4 py-3 text-center text-sm font-bold">Add visit</Link>
          <button onClick={redeem} disabled={customer.reward_status !== "ready"}
            className="rounded-2xl border-[1.5px] border-rose-soft bg-white px-4 py-3 text-sm font-bold text-rose-deep disabled:opacity-50">
            Redeem reward
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => setStatus(customer.status === "inactive" ? "active" : "inactive")}
            className="rounded-2xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink-soft">
            {customer.status === "inactive" ? "Mark active" : "Mark inactive"}
          </button>
          <Link href={`/pass/${customer.id}`} className="rounded-2xl border border-line bg-white px-4 py-2.5 text-center text-sm font-bold text-ink-soft">
            View VIP pass
          </Link>
        </div>

        <div className="card-shadow mt-4 rounded-2xl border border-line bg-white p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Staff notes</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferences, formula, allergies…"
            className="h-20 w-full rounded-xl border border-line bg-white p-3 text-sm" />
          <button onClick={saveNotes} className="btn-gold mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-bold">Save notes</button>
        </div>

        <h2 className="mb-2 mt-5 font-serif text-base font-bold">Visit history</h2>
        <div className="card-shadow rounded-2xl border border-line bg-white px-4">
          {visits.length === 0 && <p className="py-4 text-sm text-ink-soft">No visits logged yet.</p>}
          {visits.map((v) => (
            <div key={v.id} className="flex items-center justify-between border-b border-line py-3 last:border-0">
              <div>
                <b className="block text-sm">{v.service_name}</b>
                <span className="text-xs text-ink-soft">{new Date(v.visit_date).toLocaleDateString()}</span>
              </div>
              <span className="rounded-full bg-rose-soft px-2.5 py-1 text-xs font-bold text-rose-deep">
                +{v.points_added}{v.amount_spent ? ` · $${v.amount_spent}` : ""}
              </span>
            </div>
          ))}
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white shadow-lg">{toast}</div>
        )}
      </div>
    </main>
  );
}
