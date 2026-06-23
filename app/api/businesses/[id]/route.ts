import { NextRequest, NextResponse } from "next/server";
import { getBusiness, listCustomers, listServices } from "@/lib/db";
import { businessMetrics } from "@/lib/metrics";
import { qrSvg } from "@/lib/qr";
import { baseUrl } from "@/lib/util";

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
  const joinUrl = `${baseUrl()}/join/${params.id}`;
  const joinQr = await qrSvg(joinUrl);
  return NextResponse.json({ business, customers, services, metrics, joinUrl, joinQr });
}
