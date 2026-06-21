import { NextRequest, NextResponse } from "next/server";
import { listBookings, listServices } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const [bookings, services] = await Promise.all([
    listBookings(params.id),
    listServices(params.id),
  ]);
  return NextResponse.json({ bookings, services });
}
