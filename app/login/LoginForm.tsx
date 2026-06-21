"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(data.redirect || "/owner");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  }

  function quick(role: "owner" | "staff" | "admin") {
    const map = {
      owner: "owner@bella.test",
      staff: "staff@bella.test",
      admin: "admin@vipclub.test",
    };
    setEmail(map[role]);
    setPassword("vip12345");
  }

  const field = "w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-3 text-[15px]";
  const label = "mb-1.5 block text-[12px] font-bold uppercase tracking-wide text-ink-soft";

  return (
    <form onSubmit={submit}>
      <div className="mb-3">
        <label className={label}>Email</label>
        <input className={field} type="email" value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="you@salon.com" />
      </div>
      <div className="mb-4">
        <label className={label}>Password</label>
        <input className={field} type="password" value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {error && <p className="mb-3 text-sm font-semibold text-rose-deep">{error}</p>}
      <button disabled={busy}
        className="btn-primary w-full rounded-2xl px-4 py-3.5 text-base font-bold disabled:opacity-60">
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <div className="mt-4 flex gap-2">
        {(["owner", "staff", "admin"] as const).map((r) => (
          <button key={r} type="button" onClick={() => quick(r)}
            className="flex-1 rounded-xl border border-line bg-cream px-2 py-2 text-xs font-bold text-ink-soft capitalize">
            {r}
          </button>
        ))}
      </div>
    </form>
  );
}
