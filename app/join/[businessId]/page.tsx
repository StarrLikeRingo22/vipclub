import { getBusiness } from "@/lib/db";
import { JoinForm } from "./JoinForm";
import { Crest } from "@/components/Crest";
import { notFound } from "next/navigation";

export default async function JoinPage({
  params,
}: {
  params: { businessId: string };
}) {
  const business = await getBusiness(params.businessId);
  if (!business) notFound();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="phone">
        <div className="screen flex min-h-[760px] flex-col">
          <div className="flex flex-1 flex-col items-center justify-center px-7 py-10 text-center"
            style={{ background: "radial-gradient(circle at 50% 16%, #FCE6E9 0%, transparent 55%), linear-gradient(180deg,#FFF8F7,#FBEEF0)" }}>
            <Crest size={92} />
            <h1 className="mt-6 font-serif text-3xl font-extrabold leading-tight">
              Join the<br />VIP Club
            </h1>
            <p className="mt-3 max-w-[280px] text-[15px] text-ink-soft">
              {business.business_name} · Become a member to earn rewards, get appointment
              reminders, and unlock member-only offers.
            </p>
            <JoinForm businessId={business.id} businessName={business.business_name} />
          </div>
        </div>
      </div>
    </main>
  );
}
