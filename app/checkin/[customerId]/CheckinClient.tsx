"use client";

import { useState } from "react";
import type { Customer, Service } from "@/lib/types";
import { Crest } from "@/components/Crest";
import { RewardRing } from "@/components/RewardRing";
import { ServicePicker, toggleInSet } from "@/components/ServicePicker";

export function CheckinClient({
  customer: initial,
  threshold,
  businessName,
  services,
}: {
  customer: Customer;
  threshold: number;
  businessName: string;
  services: Service[];
}) {
  const [customer, setCustomer] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set(services[0] ? [services[0].id] : []));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const toggle = (id: string) => setSelected((prev) => toggleInSet(prev, id));
  const chosen = services.filter((s) => selected.has(s.id));
  const total = chosen.reduce((a, s) => a + s.price, 0);

  async function addVisit() {
    if (selected.size === 0) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/customers/${customer.id}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: chosen.map((s) => s.name).join(", ") || "Visit",
          amount: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCustomer(data.customer);
      setMsg(
        data.rewardJustEarned
          ? "Reward unlocked. A free service is now ready."
          : "Visit added — synced to their VIP pass.",
      );
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="phone">
        <div className="screen flex min-h-[760px] flex-col px-5 py-7">
          <div className="mb-2 flex items-center gap-2">
            <Crest size={28} />
            <span className="text-sm font-bold">Staff check-in · {businessName}</span>
          </div>

          <div className="card-shadow mt-2 rounded-3xl border border-line p-6 text-center"
            style={{ background: "linear-gradient(160deg,#FFFFFF,#FFF4F5)" }}>
            <h1 className="font-serif text-xl font-bold">{customer.full_name}</h1>
            <p className="text-sm text-ink-soft">
              {customer.phone} · #{customer.customer_code}
            </p>
            <div className="mt-4">
              <RewardRing
                visits={customer.points_balance}
                threshold={threshold}
                rewardStatus={customer.reward_status}
              />
            </div>
          </div>

          <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-ink-soft">
            Services performed
          </p>
          <div className="card-shadow rounded-2xl border border-line bg-white p-2">
            <ServicePicker services={services} selected={selected} toggle={toggle} maxHeightClass="max-h-[260px]" />
          </div>

          <button
            onClick={addVisit}
            disabled={busy || selected.size === 0}
            className="btn-primary mt-4 rounded-2xl px-4 py-4 text-base font-bold disabled:opacity-50"
          >
            {busy ? "Logging…" : `Add visit${total ? " · $" + total : ""}`}
          </button>

          {msg && (
            <p className="mt-3 text-center text-sm font-semibold text-leaf">{msg}</p>
          )}
          <p className="mt-3 text-center text-xs text-ink-soft">
            Only staff can add visits — customers can&apos;t edit their own points.
          </p>
        </div>
      </div>
    </main>
  );
}
