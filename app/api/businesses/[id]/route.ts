import { NextRequest, NextResponse } from "next/server";
import { getBusiness, listCustomers, listServices } from "@/lib/db";
import { businessMetrics } from "@/lib/metrics";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const business = await getBusiness(params.id);
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [customers, services, metrics] = await Promise.all([
    listCustomers(params.id),
    listServices(params.id),
    businessMetrics(params.id),
  ]);
  return NextResponse.json({ business, customers, services, metrics });
}
