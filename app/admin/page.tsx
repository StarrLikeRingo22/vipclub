"use client";

import { useEffect, useMemo, useState } from "react";
import { Crest } from "@/components/Crest";
import type { BusinessStats } from "@/lib/types";

interface Totals {
  businesses: number;
  members: number;
  visits: number;
  rewards_ready: number;
  inactive: number;
  messages: number;
  new_this_month: number;
  returning_rate: number;
}
interface Stats {
  businesses: BusinessStats[];
  totals: Totals;
  backend: { database: string; sms: string };
}

type Sort = "returning" | "members" | "visits";

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sort, setSort] = useState<Sort>("returning");

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  const shops = useMemo(() => {
    if (!stats) return [];
    const s = [...stats.businesses];
    s.sort((a, b) =>
      sort === "members" ? b.members - a.members
      : sort === "visits" ? b.visits - a.visits
      : b.returning_rate - a.returning_rate,
    );
    return s;
  }, [stats, sort]);

  if (!stats) {
    return <main className="flex min-h-screen items-center justify-center text-ink-soft">Loading analytics…</main>;
  }

  const t = stats.totals;
  const kpis: [string, string | number, string][] = [
    ["Shops", t.businesses, "🏪"],
    ["VIP members", t.members.toLocaleString(), "👥"],
    ["Returning rate", t.returning_rate + "%", "🔁"],
    ["Visits tracked", t.visits.toLocaleString(), "✅"],
    ["New this month", t.new_this_month.toLocaleString(), "✨"],
    ["Messages sent", t.messages.toLocaleString(), "✉️"],
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Crest size={42} />
          <div>
            <h1 className="font-serif text-xl font-bold sm:text-2xl">VIP Club — Analytics</h1>
            <p className="text-[11px] font-semibold uppercase tracking-[2px] text-gold">Platform &amp; Product Owners</p>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-white px-3 py-2 text-[11px] text-ink-soft">
          DB <b className="text-ink">{stats.backend.database}</b> · SMS <b className="text-ink">{stats.backend.sms}</b>
        </div>
      </div>

      {/* KPI grid */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map(([label, val, icon]) => (
          <div key={label} className="card-shadow rounded-2xl border border-line bg-white p-4">
            <div className="text-xl">{icon}</div>
            <div className="mt-2 text-2xl font-bold text-rose-deep">{val}</div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{label}</div>
          </div>
        ))}
      </div>

      {/* sort */}
      <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-bold">Shops &amp; their progress</h2>
        <div className="flex gap-2 text-xs">
          {([["returning", "Returning rate"], ["members", "Members"], ["visits", "Visits"]] as [Sort, string][]).map(
            ([id, label]) => (
              <button key={id} onClick={() => setSort(id)}
                className={"rounded-full border px-3 py-1.5 font-bold " +
                  (sort === id ? "border-rose-deep bg-rose-deep text-white" : "border-line bg-white text-ink-soft")}>
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      {/* shop cards */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {shops.map((s, i) => (
          <div key={s.business_id} className="card-shadow rounded-2xl border border-line bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#3A2C30,#221A1E)", boxShadow: "inset 0 0 0 1.2px rgba(201,162,75,.6)" }}>
                  {s.business_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <b className="block leading-tight">{s.business_name}</b>
                  <span className="text-xs text-ink-soft">{s.business_type}</span>
                </div>
              </div>
              {i === 0 && sort === "returning" && (
                <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-bold text-[#7a5e1d]">🏆 Top</span>
              )}
            </div>

            {/* returning rate bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-soft">Returning customer rate</span>
                <b className="text-rose-deep">{s.returning_rate}%</b>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#F0E2E4]">
                <div className="h-full rounded-full"
                  style={{ width: `${s.returning_rate}%`, background: "linear-gradient(90deg,#E8A0A8,#C9A24B)" }} />
              </div>
            </div>

            {/* mini stats */}
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {[
                ["Members", s.members.toLocaleString()],
                ["Visits", s.visits.toLocaleString()],
                ["Ready", s.rewards_ready],
                ["Inactive", s.inactive],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-cream py-2">
                  <div className="text-sm font-bold">{v}</div>
                  <div className="text-[10px] font-semibold uppercase text-ink-soft">{l}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
              <span>Avg {s.avg_visits} visits / member</span>
              <span>✉️ {s.messages_sent.toLocaleString()} sent</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-7 text-xs text-ink-soft">
        Live from the API across every shop. The north-star metric is{" "}
        <b className="text-ink">returning customer rate</b> — repeat visits generated. Connect Supabase for
        persistent, platform-wide history.
      </p>
    </main>
  );
}
