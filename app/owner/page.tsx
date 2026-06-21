import { DEMO_BUSINESS_ID } from "@/lib/seed";
import { OwnerApp } from "./OwnerApp";

export const dynamic = "force-dynamic";

export default function OwnerPage() {
  return <OwnerApp businessId={DEMO_BUSINESS_ID} />;
}
