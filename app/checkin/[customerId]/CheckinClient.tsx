"use client";

import { useState } from "react";
import type { Customer, Service } from "@/lib/types";
import { Crest } from "@/components/Crest";
import { RewardRing } from "@/components/RewardRing";

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
  const [svcId, setSvcId] = useState(services[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const service = services.find((s) => s.id === svcId);

  async function addVisit() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/customers/${customer.id}/visit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: service?.name ?? "Visit",
          amount: service?.price ?? 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCustomer(data.customer);
      setMsg(
        data.rewardJustEarned
          ? "🎁 Reward unlocked! A free service is now ready."
          : "✓ Visit added — synced to their VIP pass.",
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
            Service performed
          </p>
          <div className="card-shadow grid grid-cols-2 gap-2 rounded-2xl border border-line bg-white p-2">
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => setSvcId(s.id)}
                className={
                  "rounded-xl border-[1.5px] p-3 text-left transition " +
                  (s.id === svcId
                    ? "border-rose-deep bg-[#FFF5F6]"
                    : "border-transparent")
                }
              >
                <div className="text-lg">{s.emoji}</div>
                <div className="text-[13px] font-bold leading-tight">{s.name}</div>
                <div className="text-xs text-rose-deep font-bold">${s.price}</div>
              </button>
            ))}
          </div>

          <button
            onClick={addVisit}
            disabled={busy}
            className="btn-primary mt-4 rounded-2xl px-4 py-4 text-base font-bold disabled:opacity-60"
          >
            {busy ? "Logging…" : `＋ Add Visit · ${service ? "$" + service.price : ""}`}
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
