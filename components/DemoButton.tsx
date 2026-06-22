"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// One-click demo sign-in (demo owner account). Keeps test credentials off the
// public UI while still letting anyone explore the product.
export function DemoButton({
  className = "",
  label = "View demo",
}: { className?: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "owner@bella.test", password: "vip12345" }),
      });
      const data = await res.json().catch(() => ({}));
      router.push(res.ok ? (data.redirect || "/owner") : "/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={start} disabled={busy} className={className}>
      {busy ? "Loading demo…" : label}
    </button>
  );
}
