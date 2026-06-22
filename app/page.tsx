import Link from "next/link";
import { Crest } from "@/components/Crest";
import { DEMO_BUSINESS_ID } from "@/lib/seed";
import { MembersIcon, ScanIcon, HomeIcon } from "@/components/Icons";

export default function Home() {
  const links = [
    { href: `/join/${DEMO_BUSINESS_ID}`, Icon: MembersIcon, title: "Customer signup", desc: "Scan-to-join page where clients become VIP members." },
    { href: "/owner", Icon: ScanIcon, title: "Owner app", desc: "Members, scan-to-log a visit, bookings and messaging." },
    { href: "/admin", Icon: HomeIcon, title: "Admin console", desc: "Platform view across every business." },
  ];
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <div className="flex items-center gap-3">
        <Crest size={56} />
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide">VIP Club</h1>
          <p className="text-xs font-semibold uppercase tracking-[3px] text-gold">Private Rewards</p>
        </div>
      </div>

      <p className="mt-6 max-w-xl text-ink-soft">
        A retention, loyalty &amp; reactivation system for salons, barbershops and beauty
        studios. Clients join by QR, earn rewards every visit, and get reminded when
        they&apos;re due &mdash; automatically.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="card-shadow rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5"
          >
            <l.Icon width={28} height={28} className="text-rose-deep" />
            <div className="mt-3 font-bold">{l.title}</div>
            <div className="mt-1 text-sm text-ink-soft">{l.desc}</div>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-xs text-ink-soft">
        Running on the built-in demo data. Add Neon &amp; Twilio keys in{" "}
        <code className="rounded bg-blush px-1.5 py-0.5 text-rose-deep">.env</code> to switch on
        real persistence and live SMS.
      </p>
    </main>
  );
}
