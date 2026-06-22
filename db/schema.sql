-- ──────────────────────────────────────────────────────────────
-- VIP Club — Neon (Postgres) schema
-- Paste this whole file into the Neon SQL Editor (Project → SQL Editor)
-- and run it once. Safe to re-run: every statement is idempotent.
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
  category text not null default 'Other',
  name text not null,
  price numeric not null default 0,
  duration_min int not null default 45
);
create index if not exists services_business on services(business_id);

create table if not exists customers (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  full_name text not null,
  phone text not null,
  email text,
  birthday text,
  consent_sms boolean not null default true,
  status text not null default 'active',           -- active | inactive | unsubscribed
  customer_code text not null,
  visit_count int not null default 0,
  points_balance int not null default 0,
  last_visit_date timestamptz,
  reward_status text not null default 'earning',    -- earning | ready | redeemed
  next_reminder_date timestamptz,
  notes text,
  referred_by text,
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
  source text not null default 'booking',           -- qr | manual | booking
  visit_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists visits_customer on visits(customer_id);

create table if not exists bookings (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  customer_name text not null,
  service_id text not null,                          -- comma-joined ids when multiple
  time_label text not null,
  status text not null default 'scheduled',          -- scheduled | done | cancelled
  starts_at timestamptz,
  duration_min int default 45,
  notes text,
  customer_email text,
  seq int default 0,
  cancel_reason text,
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

create table if not exists users (
  id text primary key,
  business_id text references businesses(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'staff',                -- owner | staff | admin
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
  status text not null default 'completed',          -- pending | completed | rewarded
  created_at timestamptz not null default now()
);

-- ── Seed: one demo business ─────────────────────────────────────
insert into businesses (id, business_name, business_type, booking_url, reward_threshold, default_reminder_days, twilio_number)
values ('biz_bella', 'Bella Beauty Studio', 'Hair, Nails & Brows', 'https://book.example.com/bella', 5, 35, '+14155550147')
on conflict (id) do nothing;

-- ── Seed: full service catalog (hair, nails, brows/lashes, skin, barber) ──
insert into services (id, business_id, category, name, price, duration_min) values
  ('svc_wcut',   'biz_bella','Hair',          'Women''s Haircut',          45, 45),
  ('svc_mcut',   'biz_bella','Hair',          'Men''s Haircut',            30, 30),
  ('svc_kids',   'biz_bella','Hair',          'Kids'' Haircut',            22, 30),
  ('svc_blow',   'biz_bella','Hair',          'Blowout & Style',           40, 45),
  ('svc_updo',   'biz_bella','Hair',          'Updo / Event Styling',      75, 60),
  ('svc_color',  'biz_bella','Hair',          'All-Over Color',            95, 90),
  ('svc_balay',  'biz_bella','Hair',          'Balayage / Highlights',    160,150),
  ('svc_root',   'biz_bella','Hair',          'Root Touch-Up',             70, 75),
  ('svc_glaze',  'biz_bella','Hair',          'Gloss / Toner',             45, 45),
  ('svc_treat',  'biz_bella','Hair',          'Deep Conditioning Treatment',35, 30),
  ('svc_keratin','biz_bella','Hair',          'Keratin Smoothing',        180,150),
  ('svc_ext',    'biz_bella','Hair',          'Extensions Install',       250,180),
  ('svc_mani',   'biz_bella','Nails',         'Classic Manicure',          25, 30),
  ('svc_gelmani','biz_bella','Nails',         'Gel Manicure',              40, 45),
  ('svc_pedi',   'biz_bella','Nails',         'Classic Pedicure',          40, 45),
  ('svc_spapedi','biz_bella','Nails',         'Spa Pedicure',              55, 60),
  ('svc_acryl',  'biz_bella','Nails',         'Acrylic Full Set',          60, 75),
  ('svc_fill',   'biz_bella','Nails',         'Acrylic Fill',              45, 60),
  ('svc_dip',    'biz_bella','Nails',         'Dip Powder',                50, 60),
  ('svc_nailart','biz_bella','Nails',         'Nail Art (per nail)',        5, 15),
  ('svc_polish', 'biz_bella','Nails',         'Polish Change',             15, 20),
  ('svc_browsh', 'biz_bella','Brows & Lashes','Eyebrow Shaping',           20, 20),
  ('svc_browtint','biz_bella','Brows & Lashes','Eyebrow Tint',             25, 25),
  ('svc_browlam','biz_bella','Brows & Lashes','Brow Lamination',           65, 45),
  ('svc_threading','biz_bella','Brows & Lashes','Threading',               18, 20),
  ('svc_henna',  'biz_bella','Brows & Lashes','Henna Brows',               45, 45),
  ('svc_lashfill','biz_bella','Brows & Lashes','Lash Fill',                65, 60),
  ('svc_lashfull','biz_bella','Brows & Lashes','Lash Full Set',           120, 90),
  ('svc_lashlift','biz_bella','Brows & Lashes','Lash Lift & Tint',         85, 60),
  ('svc_facial', 'biz_bella','Skin & Waxing', 'Express Facial',            65, 45),
  ('svc_lipwax', 'biz_bella','Skin & Waxing', 'Lip Wax',                   12, 10),
  ('svc_facewax','biz_bella','Skin & Waxing', 'Full Face Wax',             40, 30),
  ('svc_beard',  'biz_bella','Barber',        'Beard Trim & Lineup',       20, 20),
  ('svc_hotshave','biz_bella','Barber',       'Hot Towel Shave',           30, 30)
on conflict (id) do nothing;

-- ── Seed: demo logins (passwords set by the app; PBKDF2-hashed) ──
insert into users (id, business_id, name, email, role, password_hash) values
  ('usr_owner','biz_bella','Bella Nguyen','owner@bella.test','owner', null),
  ('usr_staff','biz_bella','Tara Stylist','staff@bella.test','staff', null),
  ('usr_admin', null,'Platform Admin','admin@vipclub.test','admin', null)
on conflict (id) do nothing;
