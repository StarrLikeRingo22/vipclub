-- ──────────────────────────────────────────────────────────────
-- VIP Club — Supabase schema
-- Run in Supabase → SQL Editor. The app's service-role key bypasses
-- RLS, so policies are optional for the server-only API.
-- ──────────────────────────────────────────────────────────────

create table if not exists businesses (
  id text primary key,
  business_name text not null,
  business_type text not null default 'Salon',
  booking_url text default '',
  reward_threshold int not null default 5,
  default_reminder_days int not null default 35,
  twilio_number text,
  created_at timestamptz not null default now()
);

create table if not exists services (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  emoji text default '✨',
  name text not null,
  price numeric not null default 0
);

create table if not exists customers (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  birthday text,
  consent_sms boolean not null default true,
  status text not null default 'active',          -- active | inactive | unsubscribed
  customer_code text not null,
  visit_count int not null default 0,
  points_balance int not null default 0,
  last_visit_date timestamptz,
  reward_status text not null default 'earning',   -- earning | ready | redeemed
  created_at timestamptz not null default now()
);
create index if not exists customers_business on customers(business_id);
create index if not exists customers_phone on customers(business_id, phone);

create table if not exists visits (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  service_id text,
  service_name text not null default 'Service',
  amount_spent numeric not null default 0,
  points_added int not null default 1,
  source text not null default 'booking',          -- qr | manual | booking
  visit_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists visits_customer on visits(customer_id);

create table if not exists bookings (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  customer_name text not null,
  service_id text not null,
  time_label text not null,
  status text not null default 'scheduled',         -- scheduled | done | cancelled
  created_at timestamptz not null default now()
);
create index if not exists bookings_business on bookings(business_id);

create table if not exists messages (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text,
  message_type text not null,                        -- welcome | reminder | reward_ready | campaign
  body text not null,
  status text not null default 'sent',               -- sent | failed | mock
  provider_sid text,
  sent_at timestamptz not null default now()
);
create index if not exists messages_business on messages(business_id);

create table if not exists campaigns (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  campaign_name text not null,
  audience_type text not null,
  message_body text not null,
  sent_count int not null default 0,
  created_at timestamptz not null default now()
);

-- ── Seed one demo business so the deployed app is non-empty ──────
insert into businesses (id, business_name, business_type, booking_url, reward_threshold, default_reminder_days, twilio_number)
values ('biz_bella', 'Bella Beauty Studio', 'Hair Salon', 'https://book.example.com/bella', 5, 35, '+14155550147')
on conflict (id) do nothing;

insert into services (id, business_id, emoji, name, price) values
  ('svc_wcut','biz_bella','✂️','Women''s Haircut',30),
  ('svc_mcut','biz_bella','💈','Men''s Cut',25),
  ('svc_blow','biz_bella','💇‍♀️','Blowout & Style',40),
  ('svc_color','biz_bella','🎨','Color / Balayage',120),
  ('svc_mani','biz_bella','💅','Gel Manicure',45),
  ('svc_pedi','biz_bella','🦶','Spa Pedicure',55),
  ('svc_lash','biz_bella','👁️','Lash Fill',65),
  ('svc_beard','biz_bella','🧔','Beard Lineup',15)
on conflict (id) do nothing;
