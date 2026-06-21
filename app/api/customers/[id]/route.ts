import { NextRequest, NextResponse } from "next/server";
import { getCustomer, getBusiness, listVisits } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const customer = await getCustomer(params.id);
  if (!customer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const business = await getBusiness(customer.business_id);
  const visits = await listVisits(customer.id);
  return NextResponse.json({
    customer,
    visits,
    reward_threshold: business?.reward_threshold ?? 5,
    business_name: business?.business_name ?? "VIP Club",
  });
}
