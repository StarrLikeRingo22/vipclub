import { getSession } from "@/lib/session";
import { getBusiness, listServices } from "@/lib/db";
import { listStaff } from "@/lib/users";
import { SettingsClient } from "./SettingsClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const businessId = session.businessId;
  const [business, services, staff] = await Promise.all([
    businessId ? getBusiness(businessId) : Promise.resolve(null),
    businessId ? listServices(businessId) : Promise.resolve([]),
    businessId ? listStaff(businessId) : Promise.resolve([]),
  ]);

  return (
    <SettingsClient
      businessName={business?.business_name ?? "Your business"}
      rewardThreshold={business?.reward_threshold ?? 5}
      reminderDays={business?.default_reminder_days ?? 35}
      bookingUrl={business?.booking_url ?? ""}
      services={services.map((s) => ({ name: s.name, price: s.price, category: s.category, duration_min: s.duration_min }))}
      staff={staff.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }))}
      canManageStaff={session.role === "owner"}
    />
  );
}
