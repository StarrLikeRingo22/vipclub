"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function JoinForm({
  businessId,
  businessName,
  initialReferral = "",
}: {
  businessId: string;
  businessName: string;
  initialReferral?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(Boolean(initialReferral));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    birthday: "",
    referral_code: initialReferral,
    consent_sms: true,
  });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.full_name.trim() || !form.phone.trim()) {
      setError("Name and mobile number are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_id: businessId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push(`/pass/${data.customer.id}?welcome=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn-gold mt-6 w-full max-w-[300px] rounded-2xl px-4 py-4 text-base font-bold"
      >
        Join now — it&apos;s free
      </button>
    );
  }

  const field =
    "w-full rounded-xl border-[1.5px] border-line bg-white px-4 py-3 text-[15px]";
  const label = "block text-[12px] font-bold uppercase tracking-wide text-ink-soft mb-1.5";

  return (
    <form onSubmit={submit} className="mt-6 w-full max-w-[320px] text-left">
      <p className="mb-3 text-sm text-ink-soft">
        Joining <b>{businessName}</b> — takes 20 seconds, no app to download.
      </p>
      <div className="mb-3">
        <label className={label}>Full name</label>
        <input className={field} value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)} placeholder="Your name" />
      </div>
      <div className="mb-3">
        <label className={label}>Mobile number</label>
        <input className={field} value={form.phone} type="tel"
          onChange={(e) => set("phone", e.target.value)} placeholder="(415) 555-0192" />
      </div>
      <div className="mb-3">
        <label className={label}>Email (optional)</label>
        <input className={field} value={form.email} type="email"
          onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" />
      </div>
      <div className="mb-3">
        <label className={label}>Birthday (optional)</label>
        <input className={field} value={form.birthday}
          onChange={(e) => set("birthday", e.target.value)} placeholder="MM / DD" />
      </div>
      <div className="mb-3">
        <label className={label}>Referral code (optional)</label>
        <input className={field} value={form.referral_code}
          onChange={(e) => set("referral_code", e.target.value)} placeholder="Friend's VIP code" />
      </div>
      <label className="mb-4 flex items-start gap-2 text-[12px] text-ink-soft">
        <input type="checkbox" checked={form.consent_sms} className="mt-0.5 h-4 w-4 accent-rose-deep"
          onChange={(e) => set("consent_sms", e.target.checked)} />
        <span>I agree to receive offers &amp; reminders by SMS. Reply STOP anytime to unsubscribe.</span>
      </label>
      {error && <p className="mb-3 text-sm font-semibold text-rose-deep">{error}</p>}
      <button disabled={loading}
        className="btn-primary w-full rounded-2xl px-4 py-4 text-base font-bold disabled:opacity-60">
        {loading ? "Joining…" : "Join the VIP Club"}
      </button>
    </form>
  );
}
