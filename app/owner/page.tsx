import { getSession } from "@/lib/session";
import { OwnerApp } from "./OwnerApp";
import { DEMO_BUSINESS_ID } from "@/lib/seed";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OwnerPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Load the signed-in owner/staff member's own business. Admins (no business)
  // fall back to the demo business.
  const businessId = session.businessId ?? DEMO_BUSINESS_ID;
  return <OwnerApp businessId={businessId} user={{ name: session.name, email: session.email, role: session.role }} />;
}
