import type {
  Business,
  Service,
  Customer,
  Booking,
} from "./types";

// Deterministic demo data so the app is fully usable with zero config.

export const DEMO_BUSINESS_ID = "biz_bella";

export const seedBusinesses: Business[] = [
  { id: DEMO_BUSINESS_ID, business_name: "Bella Beauty Studio", business_type: "Hair Salon", booking_url: "https://book.example.com/bella", reward_threshold: 5, default_reminder_days: 35, twilio_number: "+14155550147", created_at: "2026-03-01T10:00:00.000Z" },
  { id: "biz_fade", business_name: "Fade & Co Barbershop", business_type: "Barbershop", booking_url: "https://book.example.com/fade", reward_threshold: 5, default_reminder_days: 21, twilio_number: "+14155550188", created_at: "2026-02-01T10:00:00.000Z" },
  { id: "biz_polished", business_name: "Polished Nails", business_type: "Nail Salon", booking_url: "https://book.example.com/polished", reward_threshold: 6, default_reminder_days: 21, twilio_number: "+14155550151", created_at: "2025-10-01T10:00:00.000Z" },
  { id: "biz_lush", business_name: "Lush Lash Bar", business_type: "Lash Studio", booking_url: "https://book.example.com/lush", reward_threshold: 5, default_reminder_days: 18, twilio_number: "+16285550102", created_at: "2026-01-01T10:00:00.000Z" },
  { id: "biz_glow", business_name: "Glow Skin Studio", business_type: "Med Spa", booking_url: "https://book.example.com/glow", reward_threshold: 5, default_reminder_days: 45, twilio_number: "+16285550119", created_at: "2025-11-01T10:00:00.000Z" },
  { id: "biz_gents", business_name: "The Gent's Room", business_type: "Barbershop", booking_url: "https://book.example.com/gents", reward_threshold: 5, default_reminder_days: 21, twilio_number: "+14155550133", created_at: "2025-12-01T10:00:00.000Z" },
  { id: "biz_serenity", business_name: "Serenity Spa", business_type: "Day Spa", booking_url: "https://book.example.com/serenity", reward_threshold: 5, default_reminder_days: 40, twilio_number: "+15105550166", created_at: "2026-06-01T10:00:00.000Z" },
];

export const seedServices: Service[] = [
  { id: "svc_wcut", business_id: DEMO_BUSINESS_ID, emoji: "✂️", name: "Women's Haircut", price: 30 },
  { id: "svc_mcut", business_id: DEMO_BUSINESS_ID, emoji: "💈", name: "Men's Cut", price: 25 },
  { id: "svc_blow", business_id: DEMO_BUSINESS_ID, emoji: "💇‍♀️", name: "Blowout & Style", price: 40 },
  { id: "svc_color", business_id: DEMO_BUSINESS_ID, emoji: "🎨", name: "Color / Balayage", price: 120 },
  { id: "svc_mani", business_id: DEMO_BUSINESS_ID, emoji: "💅", name: "Gel Manicure", price: 45 },
  { id: "svc_pedi", business_id: DEMO_BUSINESS_ID, emoji: "🦶", name: "Spa Pedicure", price: 55 },
  { id: "svc_lash", business_id: DEMO_BUSINESS_ID, emoji: "👁️", name: "Lash Fill", price: 65 },
  { id: "svc_beard", business_id: DEMO_BUSINESS_ID, emoji: "🧔", name: "Beard Lineup", price: 15 },
];

function iso(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

// Hand-authored Bella members (used by the owner demo).
const bellaCustomers: Customer[] = [
  { id: "cus_sophia", business_id: DEMO_BUSINESS_ID, full_name: "Sophia Bennett", phone: "+14155550192", email: "sophia@example.com", birthday: "06-14", consent_sms: true, status: "active", customer_code: "SOPHIA2048", visit_count: 4, points_balance: 4, last_visit_date: iso(24), reward_status: "earning", created_at: iso(100) },
  { id: "cus_maya", business_id: DEMO_BUSINESS_ID, full_name: "Maya Rodriguez", phone: "+14155550150", email: null, birthday: null, consent_sms: true, status: "active", customer_code: "MAYA5150", visit_count: 5, points_balance: 5, last_visit_date: iso(10), reward_status: "ready", created_at: iso(120) },
  { id: "cus_amara", business_id: DEMO_BUSINESS_ID, full_name: "Amara Lewis", phone: "+14155550134", email: null, birthday: null, consent_sms: true, status: "inactive", customer_code: "AMARA3134", visit_count: 2, points_balance: 2, last_visit_date: iso(41), reward_status: "earning", created_at: iso(160) },
  { id: "cus_jasmine", business_id: DEMO_BUSINESS_ID, full_name: "Jasmine Khan", phone: "+14155550148", email: "jas@example.com", birthday: null, consent_sms: true, status: "active", customer_code: "JASMIN0148", visit_count: 2, points_balance: 2, last_visit_date: iso(6), reward_status: "earning", created_at: iso(8) },
  { id: "cus_elena", business_id: DEMO_BUSINESS_ID, full_name: "Elena Torres", phone: "+14155550177", email: null, birthday: null, consent_sms: true, status: "active", customer_code: "ELENA0177", visit_count: 3, points_balance: 3, last_visit_date: iso(15), reward_status: "earning", created_at: iso(70) },
  { id: "cus_nadia", business_id: DEMO_BUSINESS_ID, full_name: "Nadia Park", phone: "+14155550199", email: null, birthday: null, consent_sms: true, status: "inactive", customer_code: "NADIA0199", visit_count: 1, points_balance: 1, last_visit_date: iso(58), reward_status: "earning", created_at: iso(90) },
];

// Deterministic generator for the other shops (analytics depth).
const FIRST = ["Olivia", "Liam", "Emma", "Noah", "Ava", "Mia", "Zoe", "Leo", "Aria", "Kai", "Nora", "Ivy", "Ruby", "Theo", "Luna", "Eli", "Maya", "Jude", "Sara", "Omar", "Dina", "Cole", "Tara", "Wes"];
const LAST = ["Carter", "Reed", "Shah", "Diaz", "Owens", "Patel", "Cole", "Frost", "Ramos", "Webb", "Nash", "Hale", "Yang", "Kerr", "Bloom"];

function makeCustomers(businessId: string, count: number, seedNum: number, threshold: number): Customer[] {
  let rng = seedNum;
  const rand = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };
  const out: Customer[] = [];
  for (let i = 0; i < count; i++) {
    const name = `${FIRST[Math.floor(rand() * FIRST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`;
    const visits = Math.floor(rand() * (threshold + 2)); // 0..threshold+1
    const lastDays = Math.floor(rand() * 75);
    const points = Math.min(visits, threshold);
    out.push({
      id: `cus_${businessId}_${i}`,
      business_id: businessId,
      full_name: name,
      phone: `+1628555${String(1000 + i).slice(-4)}`,
      email: rand() > 0.6 ? `${name.split(" ")[0].toLowerCase()}@example.com` : null,
      birthday: null,
      consent_sms: rand() > 0.05,
      status: lastDays >= 30 ? "inactive" : "active",
      customer_code: `${name.split(" ")[0].slice(0, 5).toUpperCase()}${1000 + i}`,
      visit_count: visits,
      points_balance: points,
      last_visit_date: visits > 0 ? iso(lastDays) : null,
      reward_status: points >= threshold ? "ready" : "earning",
      created_at: iso(Math.floor(rand() * 200) + 5),
    });
  }
  return out;
}

export const seedCustomers: Customer[] = [
  ...bellaCustomers,
  ...makeCustomers("biz_fade", 188, 11, 5),
  ...makeCustomers("biz_polished", 240, 23, 6),
  ...makeCustomers("biz_lush", 174, 37, 5),
  ...makeCustomers("biz_glow", 158, 51, 5),
  ...makeCustomers("biz_gents", 145, 67, 5),
  ...makeCustomers("biz_serenity", 62, 83, 5),
];

export const seedBookings: Booking[] = [
  { id: "bk_1", business_id: DEMO_BUSINESS_ID, customer_id: "cus_sophia", customer_name: "Sophia Bennett", service_id: "svc_wcut", time_label: "9:00 AM", status: "scheduled", created_at: iso(0) },
  { id: "bk_2", business_id: DEMO_BUSINESS_ID, customer_id: "cus_jasmine", customer_name: "Jasmine Khan", service_id: "svc_mani", time_label: "10:30 AM", status: "scheduled", created_at: iso(0) },
  { id: "bk_3", business_id: DEMO_BUSINESS_ID, customer_id: "cus_elena", customer_name: "Elena Torres", service_id: "svc_blow", time_label: "11:15 AM", status: "scheduled", created_at: iso(0) },
  { id: "bk_4", business_id: DEMO_BUSINESS_ID, customer_id: "cus_maya", customer_name: "Maya Rodriguez", service_id: "svc_color", time_label: "1:00 PM", status: "scheduled", created_at: iso(0) },
  { id: "bk_5", business_id: DEMO_BUSINESS_ID, customer_id: "cus_nadia", customer_name: "Nadia Park", service_id: "svc_lash", time_label: "2:30 PM", status: "scheduled", created_at: iso(0) },
  { id: "bk_6", business_id: DEMO_BUSINESS_ID, customer_id: "cus_amara", customer_name: "Amara Lewis", service_id: "svc_pedi", time_label: "4:00 PM", status: "scheduled", created_at: iso(0) },
];
