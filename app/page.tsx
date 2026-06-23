import Link from "next/link";
import { Crest } from "@/components/Crest";
import { DemoButton } from "@/components/DemoButton";
import { AccountMenu } from "@/components/AccountMenu";
import { DEMO_BUSINESS_ID } from "@/lib/seed";
import { getSession } from "@/lib/session";
import { CalendarIcon, MembersIcon, MessageIcon, CheckIcon, HomeIcon, ScanIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

const PILLARS = [
  { Icon: CalendarIcon, title: "Scheduling", desc: "Book, reschedule, and track appointments with staff assignment and no-show tracking." },
  { Icon: MembersIcon, title: "Client CRM", desc: "Full client profiles: contact details, visit history, preferences, notes, and lifetime value." },
  { Icon: MessageIcon, title: "Automated Messaging", desc: "Appointment reminders, rebooking nudges, birthdays, and reactivation campaigns." },
  { Icon: CheckIcon, title: "Rewards", desc: "Points per visit, reward thresholds, reward-ready status, and redemption history." },
  { Icon: ScanIcon, title: "Referrals", desc: "Branded referral codes that turn happy clients into new bookings, with tracking." },
  { Icon: HomeIcon, title: "Retention Analytics", desc: "Repeat-visit rate, clients due or inactive, and the revenue your follow-ups influence." },
];

export default async function Home() {
  const session = await getSession();
  const signedIn = Boolean(session);
  const dashboardHref = session?.role === "admin" ? "/admin" : "/owner";

  const access = [
    { href: `/join/${DEMO_BUSINESS_ID}`, title: "Client Join Page", desc: "Clients join through a branded signup page, give SMS consent, and receive their VIP profile.", cta: "Open join page" },
    { href: signedIn ? "/owner" : "/login", title: "Owner Dashboard", desc: "Manage clients, appointments, visits, rewards, messages, referrals, and retention performance.", cta: signedIn ? "Open dashboard" : "Sign in" },
    { href: signedIn ? "/admin" : "/login", title: "Platform Admin", desc: "Manage businesses, users, subscriptions, system settings, and platform-level data.", cta: signedIn ? "Open admin" : "Sign in" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/85 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex items-center gap-2">
            <Crest size={30} />
            <span className="font-serif text-lg font-bold tracking-wide">VIP Club</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <a href="#features" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink sm:block">Features</a>
            <a href="#pricing" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink sm:block">Pricing</a>
            {signedIn ? (
              <AccountMenu name={session!.name} dashboardHref={dashboardHref} />
            ) : (
              <>
                <DemoButton label="View demo" className="rounded-full px-3 py-2 text-sm font-semibold text-ink-soft hover:text-ink" />
                <Link href="/login" className="btn-primary rounded-full px-4 py-2 text-sm font-bold">Sign in</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% -10%, #F3EAE6 0%, transparent 60%)" }} />
          <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:pt-28">
            <p className="mb-5 inline-block rounded-full border border-line bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[2px] text-ink-soft">
              Client Management &amp; Retention Platform
            </p>
            <h1 className="mx-auto max-w-3xl font-serif text-4xl font-extrabold leading-[1.1] sm:text-5xl">
              Manage Clients. Automate Follow-Ups. Increase Repeat Visits.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-ink-soft">
              VIP Club gives salons and barbershops one place to manage scheduling, client
              profiles, visit history, automated messages, rewards, referrals, and retention data.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {signedIn ? (
                <Link href={dashboardHref} className="btn-primary w-full rounded-2xl px-6 py-3.5 text-base font-bold sm:w-auto">Go to Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="btn-primary w-full rounded-2xl px-6 py-3.5 text-base font-bold sm:w-auto">Sign In</Link>
                  <DemoButton label="View Demo" className="w-full rounded-2xl border-[1.5px] border-line bg-white px-6 py-3.5 text-base font-bold text-ink hover:bg-cream sm:w-auto" />
                </>
              )}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-line bg-white">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">Everything to run client retention</h2>
            <p className="mt-2 max-w-2xl text-ink-soft">Seven modules, one platform. Replace the spreadsheets, sticky notes, and separate reminder apps.</p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PILLARS.map(({ Icon, title, desc }) => (
                <div key={title} className="rounded-2xl border border-line bg-cream/40 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-rose-deep shadow-sm">
                    <Icon width={22} height={22} />
                  </div>
                  <h3 className="mt-4 text-base font-bold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">Built for every role</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {access.map((a) => (
                <div key={a.title} className="flex flex-col rounded-2xl border border-line bg-white p-6">
                  <h3 className="text-lg font-bold">{a.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{a.desc}</p>
                  <Link href={a.href} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-rose-deep">
                    {a.cta} <span aria-hidden>&rarr;</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-line bg-white">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center">
            <h2 className="font-serif text-2xl font-bold sm:text-3xl">Simple, per-location pricing</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-soft">
              Start with a 14-day free trial. No setup fees, cancel anytime. Pricing scales with
              your locations as you grow.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {signedIn ? (
                <Link href={dashboardHref} className="btn-primary rounded-2xl px-6 py-3.5 text-base font-bold">Go to Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="btn-primary rounded-2xl px-6 py-3.5 text-base font-bold">Start free trial</Link>
                  <DemoButton label="View demo" className="rounded-2xl border-[1.5px] border-line bg-white px-6 py-3.5 text-base font-bold text-ink hover:bg-cream" />
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-ink-soft sm:flex-row">
          <div className="flex items-center gap-2">
            <Crest size={22} />
            <span className="font-semibold text-ink">VIP Club</span>
          </div>
          <p>The client management and retention platform for salons, barbershops, and beauty studios.</p>
        </div>
      </footer>
    </div>
  );
}
