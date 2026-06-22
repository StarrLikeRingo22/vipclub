// ── Core domain types (mirror the Neon schema) ──────────────────

export type CustomerStatus = "active" | "inactive" | "unsubscribed";
export type RewardStatus = "earning" | "ready" | "redeemed";
export type BookingStatus = "scheduled" | "done" | "cancelled";
export type MessageType =
  | "welcome"
  | "reminder"
  | "reward_ready"
  | "campaign";

export interface Business {
  id: string;
  business_name: string;
  business_type: string;
  booking_url: string;
  reward_threshold: number;
  default_reminder_days: number;
  twilio_number: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  category: string;
  name: string;
  price: number;
  duration_min: number;
}

export interface Customer {
  id: string;
  business_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  consent_sms: boolean;
  status: CustomerStatus;
  customer_code: string;
  visit_count: number;
  points_balance: number;
  last_visit_date: string | null;
  reward_status: RewardStatus;
  created_at: string;
  next_reminder_date?: string | null;
  notes?: string | null;
  referred_by?: string | null;
}

export interface Referral {
  id: string;
  business_id: string;
  referrer_customer_id: string;
  referred_customer_id: string;
  referral_code: string;
  status: "pending" | "completed" | "rewarded";
  created_at: string;
}

export interface Visit {
  id: string;
  business_id: string;
  customer_id: string;
  service_id: string | null;
  service_name: string;
  amount_spent: number;
  points_added: number;
  source: "qr" | "manual" | "booking";
  visit_date: string;
  created_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  customer_id: string;
  customer_name: string;
  service_id: string;
  time_label: string;
  status: BookingStatus;
  created_at: string;
  starts_at?: string | null;   // ISO datetime of the appointment
  duration_min?: number;       // length in minutes
  notes?: string | null;
  customer_email?: string | null;
  seq?: number;                // iCal SEQUENCE — bumped on reschedule/cancel
  cancel_reason?: string | null;
}

export interface Message {
  id: string;
  business_id: string;
  customer_id: string | null;
  message_type: MessageType;
  body: string;
  status: "sent" | "failed" | "mock";
  provider_sid: string | null;
  sent_at: string;
}

export interface Campaign {
  id: string;
  business_id: string;
  campaign_name: string;
  audience_type: string;
  message_body: string;
  sent_count: number;
  created_at: string;
}

// ── Derived / view models ───────────────────────────────────────

export interface CustomerWithReward extends Customer {
  reward_threshold: number;
}

export interface BusinessStats {
  business_id: string;
  business_name: string;
  business_type: string;
  members: number;
  visits: number;
  returning_rate: number; // % of members with 2+ visits
  avg_visits: number;
  rewards_ready: number;
  inactive: number; // 30+ days since last visit
  messages_sent: number;
  new_this_month: number;
}

export interface SignupInput {
  business_id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  birthday?: string | null;
  consent_sms: boolean;
}
