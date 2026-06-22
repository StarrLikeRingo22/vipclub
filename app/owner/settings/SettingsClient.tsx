"use client";

import { useState } from "react";
import Link from "next/link";
import { Crest } from "@/components/Crest";

interface StaffMember { id: string; name: string; email: string; role: string }
interface SvcRow { name: string; price: number; category: string; duration_min: number }

export function SettingsClient({
  businessName, rewardThreshold, reminderDays, bookingUrl, services, staff: initialStaff, canManageStaff,
}: {
  businessName: string;
  rewardThreshold: number;
  reminderDays: number;
  bookingUrl: string;
  services: SvcRow[];
  staff: StaffMember[];
  canManageStaff: boolean;
}) {
  const [staff, setStaff] = useState(initialStaff);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); setBusy(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "staff" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setStaff((s) => [...s, d.user]);
      setForm({ name: "", email: "", password: "" });
      setMsg("Staff member added.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally { setBusy(false); }
  }

  const card = "card-shadow rounded-2xl border border-line bg-white p-5";
  const field = "w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-2.5 text-[15px]";
  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/owner" className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-lg text-ink-soft">&larr;</Link>
        <div className="flex items-center gap-2"><Crest size={26} /><b>Settings</b></div>
      </div>

      <div className={card}>
        <h2 className="font-serif text-lg font-bold">{businessName}</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between border-b border-line pb-2"><span className="text-ink-soft">Reward rule</span><b>{rewardThreshold} visits = 1 reward</b></div>
          <div className="flex justify-between border-b border-line pb-2"><span className="text-ink-soft">Reminder timing</span><b>{reminderDays} days</b></div>
          <div className="flex justify-between"><span className="text-ink-soft">Booking link</span><b className="max-w-[180px] truncate">{bookingUrl || "-"}</b></div>
        </div>
      </div>

      <h3 className="mb-2 mt-6 font-serif text-base font-bold">Service menu</h3>
      <div className={card + " p-0"}>
        {categories.map((cat) => (
          <div key={cat} className="border-b border-line last:border-0">
            <div className="px-5 pt-3 text-[11px] font-bold uppercase tracking-wide text-ink-soft">{cat}</div>
            <div className="divide-y divide-line">
              {services.filter((s) => s.category === cat).map((s) => (
                <div key={s.name} className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-sm font-semibold">{s.name}<span className="ml-2 text-xs font-normal text-ink-soft">{s.duration_min} min</span></span>
                  <b className="text-rose-deep">${s.price}</b>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-2 mt-6 font-serif text-base font-bold">Staff</h3>
      <div className={card + " divide-y divide-line p-0"}>
        {staff.length === 0 && <p className="px-5 py-4 text-sm text-ink-soft">No staff yet.</p>}
        {staff.map((u) => (
          <div key={u.id} className="flex items-center justify-between px-5 py-3">
            <div>
              <b className="block text-sm">{u.name}</b>
              <span className="text-xs text-ink-soft">{u.email}</span>
            </div>
            <span className="rounded-full bg-rose-soft px-2.5 py-1 text-[11px] font-bold capitalize text-rose-deep">{u.role}</span>
          </div>
        ))}
      </div>

      {canManageStaff && (
        <form onSubmit={addStaff} className={card + " mt-3"}>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Add a staff member</p>
          <input className={field + " mb-2"} placeholder="Name" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <input className={field + " mb-2"} type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <input className={field + " mb-3"} type="password" placeholder="Temporary password (6+ chars)" value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          {msg && <p className="mb-2 text-sm font-semibold text-rose-deep">{msg}</p>}
          <button disabled={busy} className="btn-primary w-full rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-60">
            {busy ? "Adding..." : "Add staff member"}
          </button>
        </form>
      )}
    </main>
  );
}
