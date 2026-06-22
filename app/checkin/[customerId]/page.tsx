import { getCustomer, getBusiness, listServices } from "@/lib/db";
import { CheckinClient } from "./CheckinClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Staff check-in screen — opened by scanning a member's VIP pass QR.
// In production this route would sit behind staff auth.
export default async function CheckinPage({
  params,
}: {
  params: { customerId: string };
}) {
  const customer = await getCustomer(params.customerId);
  if (!customer) notFound();
  const [business, services] = await Promise.all([
    getBusiness(customer.business_id),
    listServices(customer.business_id),
  ]);

  return (
    <CheckinClient
      customer={customer}
      threshold={business?.reward_threshold ?? 5}
      businessName={business?.business_name ?? "Salon"}
      services={services}
    />
  );
}
