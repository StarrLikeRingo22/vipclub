import { NextRequest, NextResponse } from "next/server";
import { redeem } from "@/lib/db";
import { requireRole } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireRole(["owner", "staff"]);
  if ("error" in auth) return auth.error;

  const customer = await redeem(params.id);
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json({ customer });
}
