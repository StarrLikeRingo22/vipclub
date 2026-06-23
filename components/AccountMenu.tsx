"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Shown in the public header when a session exists: Dashboard link + Sign out.
export function AccountMenu({ name, dashboardHref }: { name: string; dashboardHref: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const first = (name || "").split(" ")[0] || "Account";

  async function signOut() {
    setBusy(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-ink-soft sm:inline">Hi, {first}</span>
      <Link href={dashboardHref} className="btn-primary rounded-full px-4 py-2 text-sm font-bold">Dashboard</Link>
      <button onClick={signOut} disabled={busy}
        className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink disabled:opacity-60">
        {busy ? "…" : "Sign out"}
      </button>
    </div>
  );
}
