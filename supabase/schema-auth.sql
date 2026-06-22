-- ──────────────────────────────────────────────────────────────
-- VIP Club — auth + scheduling additions
-- Run AFTER schema.sql. Adds users, referrals, and the booking /
-- customer columns used by login, scheduling and reminders.
-- ──────────────────────────────────────────────────────────────

create table if not exists users (
  id text primary key,
  business_id text references businesses(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'staff',          -- owner | staff | admin
  password_hash text,
  created_at timestamptz not null default now()
);
create index if not exists users_email on users(email);

create table if not exists referrals (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  referrer_customer_id text not null references customers(id) on delete cascade,
  referred_customer_id text not null references customers(id) on delete cascade,
  referral_code text not null,
  status text not null default 'completed',     -- pending | completed | rewarded
  created_at timestamptz not null default now()
);

-- New columns used by scheduling, reminders and client notes.
alter table bookings add column if not exists starts_at timestamptz;
alter table bookings add column if not exists duration_min int default 45;
alter table bookings add column if not exists notes text;
alter table bookings add column if not exists customer_email text;
alter table bookings add column if not exists seq int default 0;
alter table bookings add column if not exists cancel_reason text;

alter table customers add column if not exists next_reminder_date timestamptz;
alter table customers add column if not exists notes text;
alter table customers add column if not exists referred_by text;

-- Seed demo logins. Passwords are set by the app on first use in demo mode;
-- in production, create users via the app (passwords are PBKDF2-hashed).
-- Example owner (replace password_hash by registering through the app):
insert into users (id, business_id, name, email, role, password_hash) values
  ('usr_owner','biz_bella','Bella Nguyen','owner@bella.test','owner', null),
  ('usr_staff','biz_bella','Tara (Stylist)','staff@bella.test','staff', null),
  ('usr_admin', null,'Platform Admin','admin@vipclub.test','admin', null)
on conflict (id) do nothing;
