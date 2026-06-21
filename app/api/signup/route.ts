import { NextRequest, NextResponse } from "next/server";
import { createCustomer, getBusiness, getCustomer, addVisit, recordMessage } from "@/lib/db";
import { getCustomerByPhone, updateCustomer } from "@/lib/clients";
import { sendSms, welcomeMessage } from "@/lib/sms";
import { baseUrl } from "@/lib/util";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const business_id = String(body.business_id ?? "").trim();
  const full_name = String(body.full_name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const referral_code = body.referral_code ? String(body.referral_code).trim() : "";

  if (!business_id || !full_name || !phone) {
    return NextResponse.json({ error: "Name, phone and business are required." }, { status: 400 });
  }
  // Basic phone sanity: at least 10 digits.
  if (phone.replace(/[^\d]/g, "").length < 10) {
    return NextResponse.json({ error: "Please enter a valid mobile number." }, { status: 400 });
  }

  const business = await getBusiness(business_id);
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  // Dedupe: if this phone is already a member, return the existing pass.
  const existing = await getCustomerByPhone(business_id, phone);
  if (existing) {
    return NextResponse.json(
      { customer: existing, passUrl: `${baseUrl()}/pass/${existing.id}`, existing: true },
      { status: 200 },
    );
  }

  const customer = await createCustomer({
    business_id, full_name, phone,
    email: body.email ? String(body.email) : null,
    birthday: body.birthday ? String(body.birthday) : null,
    consent_sms: body.consent_sms !== false,
  });

  // Referral capture: award the referrer a point.
  if (referral_code) {
    const all = await import("@/lib/db").then((m) => m.listCustomers(business_id));
    const referrer = all.find(
      (c) => c.customer_code.toLowerCase() === referral_code.toLowerCase() && c.id !== customer.id,
    );
    if (referrer) {
      await addVisit(referrer.id, "Referral bonus", 0);
      await updateCustomer(customer.id, {});
      const refreshed = await getCustomer(customer.id);
      if (refreshed) refreshed.referred_by = referrer.id;
    }
  }

  // Welcome SMS (mock unless Twilio configured).
  const passUrl = `${baseUrl()}/pass/${customer.id}`;
  if (customer.consent_sms) {
    const text = welcomeMessage(customer.full_name, business.business_name, passUrl);
    const res = await sendSms(customer.phone, text);
    await recordMessage(business_id, customer.id, "welcome", text, res.status, res.sid);
  }

  return NextResponse.json({ customer, passUrl }, { status: 201 });
}
