"use client";

import { useState } from "react";
import Link from "next/link";
import { Crest } from "@/components/Crest";

interface StaffMember { id: string; name: string; email: string; role: string }
interface SvcRow { name: string; price: number; category: string; duration_min: number }

export function SettingsClient({
  businessName, rewardThreshold, reminderDays, bookingUrl, services, staff: initialStaff, canManageStaff, joinUrl, joinQr,
}: {
  businessName: string;
  rewardThreshold: number;
  reminderDays: number;
  bookingUrl: string;
  services: SvcRow[];
  staff: StaffMember[];
  canManageStaff: boolean;
  joinUrl: string;
  joinQr: string;
}) {
  const [staff, setStaff] = useState(initialStaff);
  const [menu, setMenu] = useState<SvcRow[]>(services);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [svc, setSvc] = useState({ name: "", category: "", price: "", duration_min: "30" });
  const [svcMsg, setSvcMsg] = useState("");
  const [svcBusy, setSvcBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    setSvcMsg(""); setSvcBusy(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: svc.name, category: svc.category || "Other",
          price: Number(svc.price) || 0, duration_min: Number(svc.duration_min) || 30,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      const s = d.service as SvcRow;
      setMenu((m) => [...m, { name: s.name, category: s.category, price: s.price, duration_min: s.duration_min }]);
      setSvc({ name: "", category: "", price: "", duration_min: "30" });
      setSvcMsg("Service added.");
    } catch (err) {
      setSvcMsg(err instanceof Error ? err.message : "Failed");
    } finally { setSvcBusy(false); }
  }

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

  async function copyLink() {
    try { await navigator.clipboard.writeText(joinUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }

  const card = "card-shadow rounded-2xl border border-line bg-white p-5";
  const field = "w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-2.5 text-[15px]";
  const categories = [...new Set(menu.map((s) => s.category))];

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/owner" className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-lg text-ink-soft">&larr;</Link>
        <div className="flex items-center gap-2"><Crest size={26} /><b>Settings</b></div>
      </div>

      {joinUrl && (
        <div className={card + " text-center"}>
          <h2 className="font-serif text-lg font-bold">Client sign-up QR</h2>
          <p className="mt-1 text-sm text-ink-soft">Print this and place it at your front desk. Scanning opens your branded join page for {businessName} — new clients sign up in seconds.</p>
          <div className="mx-auto mt-4 h-48 w-48 rounded-2xl border border-line bg-white p-3" dangerouslySetInnerHTML={{ __html: joinQr }} />
          <div className="mt-3 flex items-center gap-2">
            <input readOnly value={joinUrl} className="flex-1 truncate rounded-xl border border-line bg-cream px-3 py-2 text-xs text-ink-soft" />
            <button onClick={copyLink} className="btn-primary rounded-xl px-3 py-2 text-xs font-bold">{copied ? "Copied" : "Copy"}</button>
          </div>
          <a href={joinUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-bold text-rose-deep">Open join page &rarr;</a>
        </div>
      )}

      <div className={card + " mt-4"}>
        <h2 className="font-serif text-lg font-bold">{businessName}</h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between border-b border-line pb-2"><span className="text-ink-soft">Reward rule</span><b>{rewardThreshold} visits = 1 reward</b></div>
          <div className="flex justify-between border-b border-line pb-2"><span className="text-ink-soft">Reminder timing</span><b>{reminderDays} days</b></div>
          <div className="flex justify-between"><span className="text-ink-soft">Booking link</span><b className="max-w-[180px] truncate">{bookingUrl || "-"}</b></div>
        </div>
      </div>

      <h3 className="mb-2 mt-6 font-serif text-base font-bold">Service menu</h3>
      <div className={card + " p-0"}>
        {menu.length === 0 && <p className="px-5 py-4 text-sm text-ink-soft">No services yet. Add your first one below.</p>}
        {categories.map((cat) => (
          <div key={cat} className="border-b border-line last:border-0">
            <div className="px-5 pt-3 text-[11px] font-bold uppercase tracking-wide text-ink-soft">{cat}</div>
            <div className="divide-y divide-line">
              {menu.filter((s) => s.category === cat).map((s) => (
                <div key={s.name} className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-sm font-semibold">{s.name}<span className="ml-2 text-xs font-normal text-ink-soft">{s.duration_min} min</span></span>
                  <b className="text-rose-deep">${s.price}</b>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={addService} className={card + " mt-3"}>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-soft">Add a service</p>
        <input className={field + " mb-2"} placeholder="Service name (e.g. Skin fade)" value={svc.name}
          onChange={(e) => setSvc((s) => ({ ...s, name: e.target.value }))} />
        <input className={field + " mb-2"} list="svc-cats" placeholder="Category (e.g. Haircuts)" value={svc.category}
          onChange={(e) => setSvc((s) => ({ ...s, category: e.target.value }))} />
        <datalist id="svc-cats">
          {categories.map((c) => (
            <option key={c} value={c}></option>
          ))}
        </datalist>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <input className={field} type="number" min="0" placeholder="Price ($)" value={svc.price}
            onChange={(e) => setSvc((s) => ({ ...s, price: e.target.value }))} />
          <input className={field} type="number" min="5" step="5" placeholder="Minutes" value={svc.duration_min}
            onChange={(e) => setSvc((s) => ({ ...s, duration_min: e.target.value }))} />
        </div>
        {svcMsg && <p className="mb-2 text-sm font-semibold text-rose-deep">{svcMsg}</p>}
        <button disabled={svcBusy} className="btn-primary w-full rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-60">
          {svcBusy ? "Adding..." : "Add service"}
        </button>
      </form>

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
