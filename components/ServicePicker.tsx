"use client";

import { useMemo } from "react";
import type { Service } from "@/lib/types";
import { CheckIcon } from "./Icons";

// Multi-select service list grouped by category. Used by check-in, booking and
// check-out flows so service selection looks and behaves the same everywhere.
export function ServicePicker({
  services, selected, toggle, maxHeightClass = "max-h-[46vh] sm:max-h-[300px]",
}: {
  services: Service[];
  selected: Set<string>;
  toggle: (id: string) => void;
  maxHeightClass?: string;
}) {
  const cats = useMemo(() => [...new Set(services.map((s) => s.category))], [services]);
  return (
    <div className={"overflow-y-auto " + maxHeightClass}>
      {cats.map((cat) => (
        <div key={cat} className="mb-2">
          <div className="sticky top-0 bg-white py-1 text-[11px] font-bold uppercase tracking-wide text-ink-soft">{cat}</div>
          {services.filter((s) => s.category === cat).map((s) => {
            const on = selected.has(s.id);
            return (
              <button key={s.id} type="button" onClick={() => toggle(s.id)}
                className={"mb-1.5 flex w-full items-center gap-3 rounded-xl border-[1.5px] p-3 text-left " + (on ? "border-rose bg-rose-soft" : "border-line")}>
                <span className={"flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-[1.5px] " + (on ? "border-rose-deep bg-rose-deep text-white" : "border-line")}>
                  {on && <CheckIcon width={12} height={12} />}
                </span>
                <span className="flex-1"><b className="block text-sm">{s.name}</b><span className="text-xs text-ink-soft">{s.duration_min} min</span></span>
                <b className="text-rose-deep">${s.price}</b>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Convenience hook helper for the common toggle behaviour.
export function toggleInSet(prev: Set<string>, id: string): Set<string> {
  const next = new Set(prev);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}
