import { getCustomer, getBusiness } from "@/lib/db";
import { qrSvg } from "@/lib/qr";
import { baseUrl } from "@/lib/util";
import { Crest } from "@/components/Crest";
import { RewardRing } from "@/components/RewardRing";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PassPage({
  params,
  searchParams,
}: {
  params: { customerId: string };
  searchParams: { welcome?: string };
}) {
  const customer = await getCustomer(params.customerId);
  if (!customer) notFound();
  const business = await getBusiness(customer.business_id);
  const threshold = business?.reward_threshold ?? 5;

  // The QR encodes the staff check-in URL (only staff can add a visit).
  const checkinUrl = `${baseUrl()}/checkin/${customer.id}`;
  const qr = await qrSvg(checkinUrl);

  const welcome = searchParams.welcome === "1";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="phone">
        <div className="screen flex min-h-[760px] flex-col px-5 py-7">
          {welcome && (
            <div className="mb-3 rounded-2xl bg-[#E2F1EA] px-4 py-3 text-center text-sm font-semibold text-[#3c7a62]">
              You&apos;re in! Your VIP pass is ready — and we&apos;ve texted you the link.
            </div>
          )}

          <div className="text-center">
            <h1 className="font-serif text-[22px] font-bold">Your VIP Pass</h1>
            <p className="mb-4 mt-1 text-sm text-ink-soft">
              Show this at checkout — the salon scans it to add your visit
            </p>
          </div>

          <div className="card-shadow rounded-3xl border border-line p-6"
            style={{ background: "linear-gradient(160deg,#FFFFFF,#FAF7F2)" }}>
            <div className="mb-3 flex items-center justify-center gap-2">
              <Crest size={30} />
              <b className="font-serif text-base tracking-wide">VIP CLUB</b>
            </div>

            <div className="mx-auto mb-4 h-[170px] w-[170px] rounded-2xl bg-white p-3 card-shadow"
              dangerouslySetInnerHTML={{ __html: qr }} />

            <h2 className="text-center font-serif text-xl font-bold">{customer.full_name}</h2>
            <p className="text-center text-sm text-ink-soft">
              Member #{customer.customer_code} · {business?.business_name}
            </p>

            <div className="mt-4">
              <RewardRing
                visits={customer.points_balance}
                threshold={threshold}
                rewardStatus={customer.reward_status}
              />
            </div>
          </div>

          {/* Referral */}
          <div className="card-shadow mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
            <div className="flex-1">
              <p className="text-[13px] font-bold leading-tight">Refer a friend</p>
              <p className="text-xs text-ink-soft">
                They get 25% off their first visit — you earn a VIP point.
              </p>
            </div>
            <div className="rounded-lg bg-blush px-2.5 py-1.5 text-center">
              <div className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Your code</div>
              <div className="text-sm font-extrabold text-rose-deep">{customer.customer_code}</div>
            </div>
          </div>

          <p className="mx-auto mt-4 max-w-[280px] text-center text-xs text-ink-soft">
            You can&apos;t change your own points — only the salon can, by scanning. Keeps it
            fair and safe.
          </p>
        </div>
      </div>
    </main>
  );
}
