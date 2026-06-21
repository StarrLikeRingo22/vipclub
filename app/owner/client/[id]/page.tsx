import { getCustomer, getBusiness, listVisits } from "@/lib/db";
import { ClientProfile } from "./ClientProfile";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OwnerClientPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCustomer(params.id);
  if (!customer) notFound();
  const [business, visits] = await Promise.all([
    getBusiness(customer.business_id),
    listVisits(customer.id),
  ]);

  return (
    <ClientProfile
      customer={customer}
      visits={visits}
      threshold={business?.reward_threshold ?? 5}
      reminderDays={business?.default_reminder_days ?? 35}
    />
  );
}
