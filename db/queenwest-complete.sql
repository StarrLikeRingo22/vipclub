-- =================================================================
-- VIP Club -- Queen West Barber Co.: COMPLETE one-file setup
-- Run once in Neon. Idempotent. Creates tables, patches columns,
-- loads business/logins/services/clients and the May->June story.
-- Sign in: owner@queenwest.test / vip12345
-- =================================================================

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

alter table services  add column if not exists category text not null default 'Other';
alter table services  add column if not exists duration_min int not null default 45;
alter table customers add column if not exists next_reminder_date timestamptz;
alter table customers add column if not exists notes text;
alter table customers add column if not exists referred_by text;
alter table bookings  add column if not exists starts_at timestamptz;
alter table bookings  add column if not exists duration_min int default 45;
alter table bookings  add column if not exists notes text;
alter table bookings  add column if not exists customer_email text;
alter table bookings  add column if not exists seq int default 0;
alter table bookings  add column if not exists cancel_reason text;

insert into businesses (id, business_name, business_type, booking_url, reward_threshold, default_reminder_days, twilio_number) values
  ('biz_queenwest','Queen West Barber Co.','Barbershop','https://book.queenwestbarber.co',6,35,'+14165550100') on conflict (id) do nothing;

insert into users (id, business_id, name, email, role, password_hash) values
  ('usr_qw_owner','biz_queenwest','Marco Bianchi','owner@queenwest.test','owner',null),
  ('usr_qw_staff','biz_queenwest','Devon Reid','staff@queenwest.test','staff',null) on conflict (id) do nothing;

insert into services (id, business_id, category, name, price, duration_min) values
  ('svc_qw_fade','biz_queenwest','Hair','Skin Fade',40,45),
  ('svc_qw_classic','biz_queenwest','Hair','Classic Cut',35,30),
  ('svc_qw_cutbeard','biz_queenwest','Hair','Cut & Beard',50,45),
  ('svc_qw_beard','biz_queenwest','Barber','Beard Trim',20,20),
  ('svc_qw_shave','biz_queenwest','Barber','Hot Towel Shave',35,30),
  ('svc_qw_kids','biz_queenwest','Hair','Kids Cut',25,30),
  ('svc_qw_buzz','biz_queenwest','Hair','Buzz Cut',25,20),
  ('svc_qw_wash','biz_queenwest','Hair','Cut & Wash',40,40),
  ('svc_qw_grey','biz_queenwest','Hair','Grey Blending',45,45),
  ('svc_qw_lineup','biz_queenwest','Barber','Line-up',15,15) on conflict (id) do nothing;

insert into customers (id, business_id, full_name, phone, email, consent_sms, status, customer_code, visit_count, points_balance, reward_status, created_at) values
  ('cus_qw_0001','biz_queenwest','Priya Tremblay','+14375551001',null,true,'active','PRIYA',0,0,'earning','2026-04-22 11:00:00+00'),
  ('cus_qw_0002','biz_queenwest','Malik Brown','+14375551002','malik.brown@example.com',true,'active','MALIK',0,0,'earning','2026-04-23 11:00:00+00'),
  ('cus_qw_0003','biz_queenwest','Jamal Mensah','+14375551003',null,true,'active','JAMAL',0,0,'earning','2026-04-27 11:00:00+00'),
  ('cus_qw_0004','biz_queenwest','Ethan Kim','+16475551004',null,true,'active','ETHAN',0,0,'earning','2026-04-26 11:00:00+00'),
  ('cus_qw_0005','biz_queenwest','Dmitri Gagnon','+14375551005','dmitri.gagnon@example.com',true,'active','DMITR',0,0,'earning','2026-04-17 11:00:00+00'),
  ('cus_qw_0006','biz_queenwest','Nina Pham','+16475551006',null,true,'active','NINA',0,0,'earning','2026-04-01 11:00:00+00'),
  ('cus_qw_0007','biz_queenwest','Maya Khoury','+14165551007',null,true,'active','MAYA',0,0,'earning','2026-04-06 11:00:00+00'),
  ('cus_qw_0008','biz_queenwest','Chloe Tremblay','+16475551008','chloe.tremblay@example.com',true,'active','CHLOE',0,0,'earning','2026-04-06 11:00:00+00'),
  ('cus_qw_0009','biz_queenwest','Elias Khoury','+14375551009',null,true,'active','ELIAS',0,0,'earning','2026-04-08 11:00:00+00'),
  ('cus_qw_0010','biz_queenwest','Jack Sharma','+14165551010',null,true,'active','JACK',0,0,'earning','2026-04-07 11:00:00+00'),
  ('cus_qw_0011','biz_queenwest','Chen Haddad','+14375551011','chen.haddad@example.com',true,'active','CHEN',0,0,'earning','2026-04-20 11:00:00+00'),
  ('cus_qw_0012','biz_queenwest','Aiden Gagnon','+14375551012','aiden.gagnon@example.com',true,'active','AIDEN',0,0,'earning','2026-04-01 11:00:00+00'),
  ('cus_qw_0013','biz_queenwest','Zoe Roy','+14165551013',null,true,'active','ZOE',0,0,'earning','2026-04-01 11:00:00+00'),
  ('cus_qw_0014','biz_queenwest','Jada Clark','+16475551014','jada.clark@example.com',true,'active','JADA',0,0,'earning','2026-04-17 11:00:00+00'),
  ('cus_qw_0015','biz_queenwest','Theo Scott','+14165551015',null,true,'active','THEO',0,0,'earning','2026-04-30 11:00:00+00'),
  ('cus_qw_0016','biz_queenwest','Leah Adams','+14375551016','leah.adams@example.com',true,'active','LEAH',0,0,'earning','2026-04-11 11:00:00+00'),
  ('cus_qw_0017','biz_queenwest','Jack Brown','+14165551017','jack.brown@example.com',true,'active','JACK1',0,0,'earning','2026-05-12 11:00:00+00'),
  ('cus_qw_0018','biz_queenwest','Andre Patel','+14375551018',null,true,'active','ANDRE',0,0,'earning','2026-05-18 11:00:00+00'),
  ('cus_qw_0019','biz_queenwest','Omar Khoury','+14375551019',null,true,'active','OMAR',0,0,'earning','2026-05-09 11:00:00+00'),
  ('cus_qw_0020','biz_queenwest','Ethan Osei','+14375551020',null,true,'active','ETHAN1',0,0,'earning','2026-05-12 11:00:00+00'),
  ('cus_qw_0021','biz_queenwest','Malik Wilson','+14165551021',null,true,'active','MALIK1',0,0,'earning','2026-05-09 11:00:00+00'),
  ('cus_qw_0022','biz_queenwest','Owen Kim','+14165551022',null,true,'active','OWEN',0,0,'earning','2026-05-17 11:00:00+00'),
  ('cus_qw_0023','biz_queenwest','Marcus Brown','+14375551023','marcus.brown@example.com',true,'active','MARCU',0,0,'earning','2026-05-02 11:00:00+00'),
  ('cus_qw_0024','biz_queenwest','Devon Reid','+16475551024',null,true,'active','DEVON',0,0,'earning','2026-05-14 11:00:00+00'),
  ('cus_qw_0025','biz_queenwest','Andre Reid','+14165551025','andre.reid@example.com',true,'active','ANDRE1',0,0,'earning','2026-05-25 11:00:00+00'),
  ('cus_qw_0026','biz_queenwest','Mateo Kelly','+14375551026','mateo.kelly@example.com',true,'active','MATEO',0,0,'earning','2026-05-12 11:00:00+00'),
  ('cus_qw_0027','biz_queenwest','Anton Nguyen','+14375551027',null,true,'active','ANTON',0,0,'earning','2026-05-30 11:00:00+00'),
  ('cus_qw_0028','biz_queenwest','Mateo Murphy','+16475551028',null,true,'active','MATEO1',0,0,'earning','2026-05-04 11:00:00+00'),
  ('cus_qw_0029','biz_queenwest','Diego Morin','+14375551029',null,true,'active','DIEGO',0,0,'earning','2026-05-15 11:00:00+00'),
  ('cus_qw_0030','biz_queenwest','Leah Reid','+16475551030','leah.reid@example.com',true,'active','LEAH1',0,0,'earning','2026-05-24 11:00:00+00'),
  ('cus_qw_0031','biz_queenwest','Jamal Kaur','+14165551031',null,true,'active','JAMAL1',0,0,'earning','2026-05-08 11:00:00+00'),
  ('cus_qw_0032','biz_queenwest','Oscar Tremblay','+14165551032','oscar.tremblay@example.com',true,'active','OSCAR',0,0,'earning','2026-05-14 11:00:00+00'),
  ('cus_qw_0033','biz_queenwest','Tyler Singh','+16475551033','tyler.singh@example.com',true,'active','TYLER',0,0,'earning','2026-05-13 11:00:00+00'),
  ('cus_qw_0034','biz_queenwest','Priya Clark','+14165551034',null,true,'active','PRIYA1',0,0,'earning','2026-05-29 11:00:00+00'),
  ('cus_qw_0035','biz_queenwest','Tyler Scott','+14375551035',null,true,'active','TYLER1',0,0,'earning','2026-05-21 11:00:00+00'),
  ('cus_qw_0036','biz_queenwest','Marcus Nguyen','+14375551036','marcus.nguyen@example.com',true,'active','MARCU1',0,0,'earning','2026-05-13 11:00:00+00'),
  ('cus_qw_0037','biz_queenwest','Hugo Nguyen','+16475551037',null,true,'active','HUGO',0,0,'earning','2026-05-25 11:00:00+00'),
  ('cus_qw_0038','biz_queenwest','Daniel Brown','+14375551038',null,true,'active','DANIE',0,0,'earning','2026-05-15 11:00:00+00'),
  ('cus_qw_0039','biz_queenwest','Jamal Park','+14375551039','jamal.park@example.com',true,'active','JAMAL2',0,0,'earning','2026-05-21 11:00:00+00'),
  ('cus_qw_0040','biz_queenwest','Ethan Roy','+14375551040','ethan.roy@example.com',true,'active','ETHAN2',0,0,'earning','2026-05-27 11:00:00+00'),
  ('cus_qw_0041','biz_queenwest','Olivia Wang','+14375551041','olivia.wang@example.com',true,'active','OLIVI',0,0,'earning','2026-05-09 11:00:00+00'),
  ('cus_qw_0042','biz_queenwest','Vikram Kaur','+16475551042',null,true,'active','VIKRA',0,0,'earning','2026-05-05 11:00:00+00'),
  ('cus_qw_0043','biz_queenwest','Mateo Tran','+14375551043',null,true,'active','MATEO2',0,0,'earning','2026-05-06 11:00:00+00'),
  ('cus_qw_0044','biz_queenwest','Logan Chen','+14165551044',null,true,'active','LOGAN',0,0,'earning','2026-05-30 11:00:00+00'),
  ('cus_qw_0045','biz_queenwest','Caleb Bouchard','+14165551045','caleb.bouchard@example.com',true,'active','CALEB',0,0,'earning','2026-05-25 11:00:00+00'),
  ('cus_qw_0046','biz_queenwest','Felix Pelletier','+16475551046','felix.pelletier@example.com',true,'active','FELIX',0,0,'earning','2026-05-27 11:00:00+00'),
  ('cus_qw_0047','biz_queenwest','Pavel Osei','+14375551047','pavel.osei@example.com',true,'active','PAVEL',0,0,'earning','2026-05-15 11:00:00+00'),
  ('cus_qw_0048','biz_queenwest','Leah Pham','+14165551048',null,true,'active','LEAH2',0,0,'earning','2026-05-18 11:00:00+00'),
  ('cus_qw_0049','biz_queenwest','Kofi Reid','+16475551049',null,true,'active','KOFI',0,0,'earning','2026-05-01 11:00:00+00'),
  ('cus_qw_0050','biz_queenwest','Mason Chen','+16475551050','mason.chen@example.com',true,'active','MASON',0,0,'earning','2026-05-11 11:00:00+00'),
  ('cus_qw_0051','biz_queenwest','Leah Brown','+16475551051','leah.brown@example.com',true,'active','LEAH3',0,0,'earning','2026-06-10 11:00:00+00'),
  ('cus_qw_0052','biz_queenwest','Dmitri Murphy','+14375551052','dmitri.murphy@example.com',true,'active','DMITR1',0,0,'earning','2026-06-08 11:00:00+00'),
  ('cus_qw_0053','biz_queenwest','Jack Scott','+14165551053',null,true,'active','JACK2',0,0,'earning','2026-06-17 11:00:00+00'),
  ('cus_qw_0054','biz_queenwest','Vikram Singh','+16475551054',null,true,'active','VIKRA1',0,0,'earning','2026-06-02 11:00:00+00'),
  ('cus_qw_0055','biz_queenwest','Hannah Kim','+14375551055',null,true,'active','HANNA',0,0,'earning','2026-06-05 11:00:00+00'),
  ('cus_qw_0056','biz_queenwest','Kwame Gagnon','+14165551056',null,true,'active','KWAME',0,0,'earning','2026-06-11 11:00:00+00'),
  ('cus_qw_0057','biz_queenwest','Mateo Wang','+14165551057','mateo.wang@example.com',true,'active','MATEO3',0,0,'earning','2026-06-10 11:00:00+00'),
  ('cus_qw_0058','biz_queenwest','Omar Li','+14375551058',null,true,'active','OMAR1',0,0,'earning','2026-06-06 11:00:00+00'),
  ('cus_qw_0059','biz_queenwest','Jack Clark','+16475551059','jack.clark@example.com',true,'active','JACK3',0,0,'earning','2026-06-03 11:00:00+00'),
  ('cus_qw_0060','biz_queenwest','Tyler Adams','+16475551060','tyler.adams@example.com',true,'active','TYLER2',0,0,'earning','2026-06-09 11:00:00+00'),
  ('cus_qw_0061','biz_queenwest','Liam Wang','+14165551061',null,true,'active','LIAM',0,0,'earning','2026-06-06 11:00:00+00'),
  ('cus_qw_0062','biz_queenwest','Raj Kelly','+14375551062','raj.kelly@example.com',true,'active','RAJ',0,0,'earning','2026-06-13 11:00:00+00'),
  ('cus_qw_0063','biz_queenwest','Malik Chen','+16475551063','malik.chen@example.com',true,'active','MALIK2',0,0,'earning','2026-06-05 11:00:00+00'),
  ('cus_qw_0064','biz_queenwest','Emma Khoury','+14375551064','emma.khoury@example.com',true,'active','EMMA',0,0,'earning','2026-06-11 11:00:00+00'),
  ('cus_qw_0065','biz_queenwest','Devon Kelly','+14375551065','devon.kelly@example.com',true,'active','DEVON1',0,0,'earning','2026-06-17 11:00:00+00'),
  ('cus_qw_0066','biz_queenwest','Logan Romano','+16475551066',null,true,'active','LOGAN1',0,0,'earning','2026-06-03 11:00:00+00'),
  ('cus_qw_0067','biz_queenwest','Liam Tran','+14165551067','liam.tran@example.com',true,'active','LIAM1',0,0,'earning','2026-06-05 11:00:00+00'),
  ('cus_qw_0068','biz_queenwest','Mason Wang','+16475551068',null,true,'active','MASON1',0,0,'earning','2026-06-05 11:00:00+00'),
  ('cus_qw_0069','biz_queenwest','Theo Lavigne','+16475551069',null,true,'active','THEO1',0,0,'earning','2026-06-14 11:00:00+00'),
  ('cus_qw_0070','biz_queenwest','Priya Adams','+14165551070','priya.adams@example.com',true,'active','PRIYA2',0,0,'earning','2026-06-18 11:00:00+00'),
  ('cus_qw_0071','biz_queenwest','Hugo Pham','+16475551071','hugo.pham@example.com',true,'active','HUGO1',0,0,'earning','2026-06-14 11:00:00+00'),
  ('cus_qw_0072','biz_queenwest','Maya Morin','+14375551072','maya.morin@example.com',true,'active','MAYA1',0,0,'earning','2026-06-05 11:00:00+00'),
  ('cus_qw_0073','biz_queenwest','Emma Brown','+16475551073',null,true,'active','EMMA1',0,0,'earning','2026-06-11 11:00:00+00'),
  ('cus_qw_0074','biz_queenwest','Daniel Romano','+14165551074',null,true,'active','DANIE1',0,0,'earning','2026-06-04 11:00:00+00'),
  ('cus_qw_0075','biz_queenwest','Emma Bouchard','+16475551075',null,true,'active','EMMA2',0,0,'earning','2026-06-18 11:00:00+00'),
  ('cus_qw_0076','biz_queenwest','Kofi Khoury','+16475551076',null,true,'active','KOFI1',0,0,'earning','2026-06-09 11:00:00+00'),
  ('cus_qw_0077','biz_queenwest','Oscar Pham','+16475551077',null,true,'active','OSCAR1',0,0,'earning','2026-06-17 11:00:00+00'),
  ('cus_qw_0078','biz_queenwest','Jamal Adams','+16475551078',null,true,'active','JAMAL3',0,0,'earning','2026-06-18 11:00:00+00'),
  ('cus_qw_0079','biz_queenwest','Lucas Haddad','+14165551079','lucas.haddad@example.com',true,'active','LUCAS',0,0,'earning','2026-06-07 11:00:00+00'),
  ('cus_qw_0080','biz_queenwest','Ethan Nguyen','+14375551080',null,true,'active','ETHAN3',0,0,'earning','2026-06-08 11:00:00+00'),
  ('cus_qw_0081','biz_queenwest','Owen Murphy','+16475551081',null,true,'active','OWEN1',0,0,'earning','2026-06-14 11:00:00+00'),
  ('cus_qw_0082','biz_queenwest','Lucas Kaur','+14165551082','lucas.kaur@example.com',true,'active','LUCAS1',0,0,'earning','2026-06-10 11:00:00+00'),
  ('cus_qw_0083','biz_queenwest','Kofi Tremblay','+16475551083','kofi.tremblay@example.com',true,'active','KOFI2',0,0,'earning','2026-06-15 11:00:00+00'),
  ('cus_qw_0084','biz_queenwest','Omar Ferrari','+14375551084',null,true,'active','OMAR2',0,0,'earning','2026-06-10 11:00:00+00'),
  ('cus_qw_0085','biz_queenwest','Omar Murphy','+14165551085','omar.murphy@example.com',true,'active','OMAR3',0,0,'earning','2026-06-08 11:00:00+00'),
  ('cus_qw_0086','biz_queenwest','Sophia Gagnon','+14375551086','sophia.gagnon@example.com',true,'active','SOPHI',0,0,'earning','2026-06-04 11:00:00+00'),
  ('cus_qw_0087','biz_queenwest','Kofi Kim','+16475551087','kofi.kim@example.com',true,'active','KOFI3',0,0,'earning','2026-06-16 11:00:00+00'),
  ('cus_qw_0088','biz_queenwest','Zoe Clark','+14165551088','zoe.clark@example.com',true,'active','ZOE1',0,0,'earning','2026-06-11 11:00:00+00'),
  ('cus_qw_0089','biz_queenwest','Caleb Kelly','+14165551089',null,true,'active','CALEB1',0,0,'earning','2026-06-14 11:00:00+00'),
  ('cus_qw_0090','biz_queenwest','Noah Gagnon','+14375551090',null,true,'active','NOAH',0,0,'earning','2026-06-18 11:00:00+00'),
  ('cus_qw_0091','biz_queenwest','Hannah Lavigne','+14165551091',null,true,'active','HANNA1',0,0,'earning','2026-06-14 11:00:00+00'),
  ('cus_qw_0092','biz_queenwest','Nathan Romano','+14165551092','nathan.romano@example.com',true,'active','NATHA',0,0,'earning','2026-06-10 11:00:00+00'),
  ('cus_qw_0093','biz_queenwest','Nina Tran','+16475551093','nina.tran@example.com',true,'active','NINA1',0,0,'earning','2026-06-10 11:00:00+00'),
  ('cus_qw_0094','biz_queenwest','Chen Osei','+14165551094','chen.osei@example.com',true,'active','CHEN1',0,0,'earning','2026-06-13 11:00:00+00'),
  ('cus_qw_0095','biz_queenwest','Logan Pham','+14375551095','logan.pham@example.com',true,'active','LOGAN2',0,0,'earning','2026-06-21 11:00:00+00'),
  ('cus_qw_0096','biz_queenwest','Noah Haddad','+14375551096','noah.haddad@example.com',true,'active','NOAH1',0,0,'earning','2026-06-08 11:00:00+00'),
  ('cus_qw_0097','biz_queenwest','Maya Rossi','+14165551097','maya.rossi@example.com',true,'active','MAYA2',0,0,'earning','2026-06-12 11:00:00+00'),
  ('cus_qw_0098','biz_queenwest','Amara Wang','+16475551098','amara.wang@example.com',true,'active','AMARA',0,0,'earning','2026-06-20 11:00:00+00'),
  ('cus_qw_0099','biz_queenwest','Vikram Nguyen','+14165551099',null,true,'active','VIKRA2',0,0,'earning','2026-06-09 11:00:00+00'),
  ('cus_qw_0100','biz_queenwest','Daniel Singh','+14375551100',null,true,'active','DANIE2',0,0,'earning','2026-06-18 11:00:00+00'),
  ('cus_qw_0101','biz_queenwest','Raj Mensah','+14375551101',null,true,'active','RAJ1',0,0,'earning','2026-06-07 11:00:00+00'),
  ('cus_qw_0102','biz_queenwest','Ethan Haddad','+16475551102',null,true,'active','ETHAN4',0,0,'earning','2026-06-07 11:00:00+00'),
  ('cus_qw_0103','biz_queenwest','Hassan Rossi','+14165551103',null,true,'active','HASSA',0,0,'earning','2026-06-04 11:00:00+00'),
  ('cus_qw_0104','biz_queenwest','Raj Tremblay','+16475551104','raj.tremblay@example.com',true,'active','RAJ2',0,0,'earning','2026-06-12 11:00:00+00'),
  ('cus_qw_0105','biz_queenwest','Liam Osei','+16475551105','liam.osei@example.com',true,'active','LIAM2',0,0,'earning','2026-06-03 11:00:00+00'),
  ('cus_qw_0106','biz_queenwest','Priya Lavigne','+14165551106','priya.lavigne@example.com',true,'active','PRIYA3',0,0,'earning','2026-06-06 11:00:00+00'),
  ('cus_qw_0107','biz_queenwest','Jamal Tran','+16475551107','jamal.tran@example.com',true,'active','JAMAL4',0,0,'earning','2026-06-04 11:00:00+00'),
  ('cus_qw_0108','biz_queenwest','Maya Murphy','+14165551108',null,true,'active','MAYA3',0,0,'earning','2026-06-09 11:00:00+00'),
  ('cus_qw_0109','biz_queenwest','Hannah Walsh','+14165551109','hannah.walsh@example.com',true,'active','HANNA2',0,0,'earning','2026-06-03 11:00:00+00'),
  ('cus_qw_0110','biz_queenwest','Jack Bouchard','+16475551110','jack.bouchard@example.com',true,'active','JACK4',0,0,'earning','2026-06-14 11:00:00+00'),
  ('cus_qw_0111','biz_queenwest','Caleb Khoury','+14375551111',null,true,'active','CALEB2',0,0,'earning','2026-06-09 11:00:00+00'),
  ('cus_qw_0112','biz_queenwest','Vikram Haddad','+14375551112','vikram.haddad@example.com',true,'active','VIKRA3',0,0,'earning','2026-06-10 11:00:00+00'),
  ('cus_qw_0113','biz_queenwest','Liam Tran','+14165551113','liam.tran@example.com',true,'active','LIAM3',0,0,'earning','2026-06-19 11:00:00+00'),
  ('cus_qw_0114','biz_queenwest','Jada Mensah','+14165551114','jada.mensah@example.com',true,'active','JADA1',0,0,'earning','2026-06-10 11:00:00+00'),
  ('cus_qw_0115','biz_queenwest','Omar Romano','+16475551115',null,true,'active','OMAR4',0,0,'earning','2026-06-14 11:00:00+00'),
  ('cus_qw_0116','biz_queenwest','Jada Patel','+14375551116','jada.patel@example.com',true,'active','JADA2',0,0,'earning','2026-06-21 11:00:00+00'),
  ('cus_qw_0117','biz_queenwest','Chloe Okafor','+14375551117','chloe.okafor@example.com',true,'active','CHLOE1',0,0,'earning','2026-06-14 11:00:00+00'),
  ('cus_qw_0118','biz_queenwest','Olivia Tran','+14165551118','olivia.tran@example.com',true,'active','OLIVI1',0,0,'earning','2026-06-05 11:00:00+00'),
  ('cus_qw_0119','biz_queenwest','Aisha Patel','+14375551119',null,true,'active','AISHA',0,0,'earning','2026-06-14 11:00:00+00'),
  ('cus_qw_0120','biz_queenwest','Anton Murphy','+14165551120','anton.murphy@example.com',true,'active','ANTON1',0,0,'earning','2026-06-02 11:00:00+00'),
  ('cus_qw_0121','biz_queenwest','Andre Tremblay','+14375551121',null,true,'active','ANDRE2',0,0,'earning','2026-06-07 11:00:00+00'),
  ('cus_qw_0122','biz_queenwest','Hugo Murphy','+14375551122','hugo.murphy@example.com',true,'active','HUGO2',0,0,'earning','2026-06-12 11:00:00+00') on conflict (id) do nothing;

delete from visits    where business_id='biz_queenwest';
delete from messages  where business_id='biz_queenwest';
delete from referrals where business_id='biz_queenwest';
delete from bookings  where business_id='biz_queenwest';

insert into visits (id, business_id, customer_id, service_id, service_name, amount_spent, points_added, source, visit_date, created_at) values
  ('vis_qw_0001','biz_queenwest','cus_qw_0017','svc_qw_lineup','Line-up',15,1,'booking','2026-05-25 12:15:00+00','2026-05-25 12:15:00+00'),
  ('vis_qw_0002','biz_queenwest','cus_qw_0088','svc_qw_lineup','Line-up',15,1,'booking','2026-05-05 11:15:00+00','2026-05-05 11:15:00+00'),
  ('vis_qw_0003','biz_queenwest','cus_qw_0063','svc_qw_lineup','Line-up',15,1,'booking','2026-05-12 10:00:00+00','2026-05-12 10:00:00+00'),
  ('vis_qw_0004','biz_queenwest','cus_qw_0018','svc_qw_beard','Beard Trim',20,1,'booking','2026-05-11 16:45:00+00','2026-05-11 16:45:00+00'),
  ('vis_qw_0005','biz_queenwest','cus_qw_0107','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-05-06 14:15:00+00','2026-05-06 14:15:00+00'),
  ('vis_qw_0006','biz_queenwest','cus_qw_0101','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-05-28 11:15:00+00','2026-05-28 11:15:00+00'),
  ('vis_qw_0007','biz_queenwest','cus_qw_0035','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-05-23 12:30:00+00','2026-05-23 12:30:00+00'),
  ('vis_qw_0008','biz_queenwest','cus_qw_0059','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-05-11 13:45:00+00','2026-05-11 13:45:00+00'),
  ('vis_qw_0009','biz_queenwest','cus_qw_0048','svc_qw_kids','Kids Cut',25,1,'booking','2026-05-23 09:15:00+00','2026-05-23 09:15:00+00'),
  ('vis_qw_0010','biz_queenwest','cus_qw_0046','svc_qw_lineup','Line-up',15,1,'booking','2026-05-23 12:45:00+00','2026-05-23 12:45:00+00'),
  ('vis_qw_0011','biz_queenwest','cus_qw_0106','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-05-14 15:00:00+00','2026-05-14 15:00:00+00'),
  ('vis_qw_0012','biz_queenwest','cus_qw_0080','svc_qw_lineup','Line-up',15,1,'booking','2026-05-05 11:30:00+00','2026-05-05 11:30:00+00'),
  ('vis_qw_0013','biz_queenwest','cus_qw_0026','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-10 16:00:00+00','2026-06-10 16:00:00+00'),
  ('vis_qw_0014','biz_queenwest','cus_qw_0001','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-08 13:00:00+00','2026-06-08 13:00:00+00'),
  ('vis_qw_0015','biz_queenwest','cus_qw_0107','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-22 13:45:00+00','2026-06-22 13:45:00+00'),
  ('vis_qw_0016','biz_queenwest','cus_qw_0107','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-18 12:45:00+00','2026-06-18 12:45:00+00'),
  ('vis_qw_0017','biz_queenwest','cus_qw_0035','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-11 11:00:00+00','2026-06-11 11:00:00+00'),
  ('vis_qw_0018','biz_queenwest','cus_qw_0050','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-20 14:30:00+00','2026-06-20 14:30:00+00'),
  ('vis_qw_0019','biz_queenwest','cus_qw_0041','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-04 14:45:00+00','2026-06-04 14:45:00+00'),
  ('vis_qw_0020','biz_queenwest','cus_qw_0014','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-13 14:00:00+00','2026-06-13 14:00:00+00'),
  ('vis_qw_0021','biz_queenwest','cus_qw_0068','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-04 18:15:00+00','2026-06-04 18:15:00+00'),
  ('vis_qw_0022','biz_queenwest','cus_qw_0034','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-01 15:30:00+00','2026-06-01 15:30:00+00'),
  ('vis_qw_0023','biz_queenwest','cus_qw_0060','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-12 12:00:00+00','2026-06-12 12:00:00+00'),
  ('vis_qw_0024','biz_queenwest','cus_qw_0060','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-04 12:15:00+00','2026-06-04 12:15:00+00'),
  ('vis_qw_0025','biz_queenwest','cus_qw_0120','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-05 12:15:00+00','2026-06-05 12:15:00+00'),
  ('vis_qw_0026','biz_queenwest','cus_qw_0121','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-14 15:00:00+00','2026-06-14 15:00:00+00'),
  ('vis_qw_0027','biz_queenwest','cus_qw_0109','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-15 17:30:00+00','2026-06-15 17:30:00+00'),
  ('vis_qw_0028','biz_queenwest','cus_qw_0086','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-05 17:15:00+00','2026-06-05 17:15:00+00'),
  ('vis_qw_0029','biz_queenwest','cus_qw_0080','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-17 14:45:00+00','2026-06-17 14:45:00+00'),
  ('vis_qw_0030','biz_queenwest','cus_qw_0080','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-20 16:30:00+00','2026-06-20 16:30:00+00'),
  ('vis_qw_0031','biz_queenwest','cus_qw_0002','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-09 15:30:00+00','2026-06-09 15:30:00+00'),
  ('vis_qw_0032','biz_queenwest','cus_qw_0002','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-16 14:45:00+00','2026-06-16 14:45:00+00'),
  ('vis_qw_0033','biz_queenwest','cus_qw_0108','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-03 09:30:00+00','2026-06-03 09:30:00+00'),
  ('vis_qw_0034','biz_queenwest','cus_qw_0009','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-16 10:00:00+00','2026-06-16 10:00:00+00'),
  ('vis_qw_0035','biz_queenwest','cus_qw_0069','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-18 18:00:00+00','2026-06-18 18:00:00+00'),
  ('vis_qw_0036','biz_queenwest','cus_qw_0110','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-07 17:00:00+00','2026-06-07 17:00:00+00'),
  ('vis_qw_0037','biz_queenwest','cus_qw_0087','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-06 12:00:00+00','2026-06-06 12:00:00+00'),
  ('vis_qw_0038','biz_queenwest','cus_qw_0024','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-09 15:00:00+00','2026-06-09 15:00:00+00'),
  ('vis_qw_0039','biz_queenwest','cus_qw_0048','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-06 14:00:00+00','2026-06-06 14:00:00+00'),
  ('vis_qw_0040','biz_queenwest','cus_qw_0048','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-01 17:15:00+00','2026-06-01 17:15:00+00'),
  ('vis_qw_0041','biz_queenwest','cus_qw_0065','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-03 14:45:00+00','2026-06-03 14:45:00+00'),
  ('vis_qw_0042','biz_queenwest','cus_qw_0073','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-05 18:30:00+00','2026-06-05 18:30:00+00'),
  ('vis_qw_0043','biz_queenwest','cus_qw_0073','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-19 18:30:00+00','2026-06-19 18:30:00+00'),
  ('vis_qw_0044','biz_queenwest','cus_qw_0113','svc_qw_lineup','Line-up',15,1,'booking','2026-06-14 10:30:00+00','2026-06-14 10:30:00+00'),
  ('vis_qw_0045','biz_queenwest','cus_qw_0090','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-01 14:00:00+00','2026-06-01 14:00:00+00'),
  ('vis_qw_0046','biz_queenwest','cus_qw_0081','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-04 11:00:00+00','2026-06-04 11:00:00+00'),
  ('vis_qw_0047','biz_queenwest','cus_qw_0032','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-11 17:00:00+00','2026-06-11 17:00:00+00'),
  ('vis_qw_0048','biz_queenwest','cus_qw_0032','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-19 09:00:00+00','2026-06-19 09:00:00+00'),
  ('vis_qw_0049','biz_queenwest','cus_qw_0016','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-11 12:30:00+00','2026-06-11 12:30:00+00'),
  ('vis_qw_0050','biz_queenwest','cus_qw_0100','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-06 12:15:00+00','2026-06-06 12:15:00+00'),
  ('vis_qw_0051','biz_queenwest','cus_qw_0033','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-05 14:15:00+00','2026-06-05 14:15:00+00'),
  ('vis_qw_0052','biz_queenwest','cus_qw_0007','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-12 09:15:00+00','2026-06-12 09:15:00+00'),
  ('vis_qw_0053','biz_queenwest','cus_qw_0017','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-21 14:45:00+00','2026-06-21 14:45:00+00'),
  ('vis_qw_0054','biz_queenwest','cus_qw_0023','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-01 09:00:00+00','2026-06-01 09:00:00+00'),
  ('vis_qw_0055','biz_queenwest','cus_qw_0119','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-12 10:15:00+00','2026-06-12 10:15:00+00'),
  ('vis_qw_0056','biz_queenwest','cus_qw_0012','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-11 11:00:00+00','2026-06-11 11:00:00+00'),
  ('vis_qw_0057','biz_queenwest','cus_qw_0012','svc_qw_lineup','Line-up',15,1,'booking','2026-06-06 09:00:00+00','2026-06-06 09:00:00+00'),
  ('vis_qw_0058','biz_queenwest','cus_qw_0055','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-17 14:30:00+00','2026-06-17 14:30:00+00'),
  ('vis_qw_0059','biz_queenwest','cus_qw_0114','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-10 09:15:00+00','2026-06-10 09:15:00+00'),
  ('vis_qw_0060','biz_queenwest','cus_qw_0028','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-01 10:30:00+00','2026-06-01 10:30:00+00'),
  ('vis_qw_0061','biz_queenwest','cus_qw_0122','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-04 14:15:00+00','2026-06-04 14:15:00+00'),
  ('vis_qw_0062','biz_queenwest','cus_qw_0063','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-16 18:00:00+00','2026-06-16 18:00:00+00'),
  ('vis_qw_0063','biz_queenwest','cus_qw_0006','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-15 12:00:00+00','2026-06-15 12:00:00+00'),
  ('vis_qw_0064','biz_queenwest','cus_qw_0101','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-21 18:15:00+00','2026-06-21 18:15:00+00'),
  ('vis_qw_0065','biz_queenwest','cus_qw_0072','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-02 13:45:00+00','2026-06-02 13:45:00+00'),
  ('vis_qw_0066','biz_queenwest','cus_qw_0084','svc_qw_lineup','Line-up',15,1,'booking','2026-06-20 14:45:00+00','2026-06-20 14:45:00+00'),
  ('vis_qw_0067','biz_queenwest','cus_qw_0056','svc_qw_lineup','Line-up',15,1,'booking','2026-06-11 15:30:00+00','2026-06-11 15:30:00+00'),
  ('vis_qw_0068','biz_queenwest','cus_qw_0042','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-02 15:00:00+00','2026-06-02 15:00:00+00'),
  ('vis_qw_0069','biz_queenwest','cus_qw_0088','svc_qw_lineup','Line-up',15,1,'booking','2026-06-11 12:15:00+00','2026-06-11 12:15:00+00'),
  ('vis_qw_0070','biz_queenwest','cus_qw_0088','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-14 16:15:00+00','2026-06-14 16:15:00+00'),
  ('vis_qw_0071','biz_queenwest','cus_qw_0046','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-04 09:00:00+00','2026-06-04 09:00:00+00'),
  ('vis_qw_0072','biz_queenwest','cus_qw_0020','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-07 17:45:00+00','2026-06-07 17:45:00+00'),
  ('vis_qw_0073','biz_queenwest','cus_qw_0021','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-09 18:30:00+00','2026-06-09 18:30:00+00'),
  ('vis_qw_0074','biz_queenwest','cus_qw_0099','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-02 15:45:00+00','2026-06-02 15:45:00+00'),
  ('vis_qw_0075','biz_queenwest','cus_qw_0013','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-18 10:30:00+00','2026-06-18 10:30:00+00'),
  ('vis_qw_0076','biz_queenwest','cus_qw_0038','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-10 10:15:00+00','2026-06-10 10:15:00+00'),
  ('vis_qw_0077','biz_queenwest','cus_qw_0079','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-17 12:00:00+00','2026-06-17 12:00:00+00'),
  ('vis_qw_0078','biz_queenwest','cus_qw_0066','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-10 13:15:00+00','2026-06-10 13:15:00+00'),
  ('vis_qw_0079','biz_queenwest','cus_qw_0066','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-09 10:30:00+00','2026-06-09 10:30:00+00'),
  ('vis_qw_0080','biz_queenwest','cus_qw_0057','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-10 11:30:00+00','2026-06-10 11:30:00+00'),
  ('vis_qw_0081','biz_queenwest','cus_qw_0061','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-07 09:00:00+00','2026-06-07 09:00:00+00'),
  ('vis_qw_0082','biz_queenwest','cus_qw_0061','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-02 13:30:00+00','2026-06-02 13:30:00+00'),
  ('vis_qw_0083','biz_queenwest','cus_qw_0098','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-20 18:15:00+00','2026-06-20 18:15:00+00'),
  ('vis_qw_0084','biz_queenwest','cus_qw_0117','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-22 10:15:00+00','2026-06-22 10:15:00+00'),
  ('vis_qw_0085','biz_queenwest','cus_qw_0062','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-09 14:15:00+00','2026-06-09 14:15:00+00'),
  ('vis_qw_0086','biz_queenwest','cus_qw_0076','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-08 18:15:00+00','2026-06-08 18:15:00+00'),
  ('vis_qw_0087','biz_queenwest','cus_qw_0093','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-04 11:45:00+00','2026-06-04 11:45:00+00');

update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-08 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0001';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-16 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0002';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0003';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0004';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0005';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-15 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0006';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-12 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0007';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0008';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-16 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0009';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0010';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0038' where id='cus_qw_0011';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-11 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0012';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-18 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0013';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-13 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0014';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0015';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-11 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0016';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-21 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0017';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-11 12:00:00+00', reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0018';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0019';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-07 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0020';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-09 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0021';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0022';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-01 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0023';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-09 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0024';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0055' where id='cus_qw_0025';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-10 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0026';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0027';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-01 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0028';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0029';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0030';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0031';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-19 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0032';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-05 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0033';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-01 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0034';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-11 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0035';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0036';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0037';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-10 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0038';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0039';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0040';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-04 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0041';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-02 12:00:00+00', reward_status='earning', status='active', referred_by='cus_qw_0062' where id='cus_qw_0042';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0043';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0044';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0045';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-04 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0046';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0047';
update customers set visit_count=3, points_balance=3, last_visit_date='2026-06-06 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0048';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0049';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-20 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0050';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0051';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0020' where id='cus_qw_0052';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0053';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0054';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-17 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0055';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-11 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0056';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-10 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0057';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0058';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-11 12:00:00+00', reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0059';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-12 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0060';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-07 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0061';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-09 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0062';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-16 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0063';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0064';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-03 12:00:00+00', reward_status='earning', status='active', referred_by='cus_qw_0032' where id='cus_qw_0065';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-10 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0066';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0067';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-04 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0068';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-18 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0069';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0070';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0071';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-02 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0072';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-19 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0073';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0074';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0056' where id='cus_qw_0075';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-08 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0076';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0077';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0078';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-17 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0079';
update customers set visit_count=3, points_balance=3, last_visit_date='2026-06-20 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0080';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-04 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0081';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0082';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0083';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-20 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0084';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0085';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-05 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0086';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-06 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0087';
update customers set visit_count=3, points_balance=3, last_visit_date='2026-06-14 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0088';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0089';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-01 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0090';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0091';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0092';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-04 12:00:00+00', reward_status='earning', status='active', referred_by='cus_qw_0063' where id='cus_qw_0093';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0094';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0095';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0096';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0035' where id='cus_qw_0097';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-20 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0098';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-02 12:00:00+00', reward_status='earning', status='active', referred_by='cus_qw_0061' where id='cus_qw_0099';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-06 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0100';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-21 12:00:00+00', reward_status='earning', status='active', referred_by='cus_qw_0041' where id='cus_qw_0101';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0102';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0103';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0104';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0105';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-14 12:00:00+00', reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0106';
update customers set visit_count=3, points_balance=3, last_visit_date='2026-06-22 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0107';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-03 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0108';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-15 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0109';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-07 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0110';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0111';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0112';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-14 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0113';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-10 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0114';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0115';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0116';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-22 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0117';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0118';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-12 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0119';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-05 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0120';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-14 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0121';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-04 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0122';

insert into bookings (id, business_id, customer_id, customer_name, service_id, time_label, status, starts_at, duration_min, cancel_reason) values
  ('bk_qw_001','biz_queenwest','cus_qw_0044','Logan Chen','svc_qw_buzz','Completed','done','2026-05-20 15:00:00+00',25,null),
  ('bk_qw_002','biz_queenwest','cus_qw_0016','Leah Adams','svc_qw_buzz','Completed','done','2026-05-17 11:45:00+00',25,null),
  ('bk_qw_003','biz_queenwest','cus_qw_0068','Mason Wang','svc_qw_buzz','Completed','done','2026-05-06 10:15:00+00',25,null),
  ('bk_qw_004','biz_queenwest','cus_qw_0031','Jamal Kaur','svc_qw_kids','Completed','done','2026-05-08 15:30:00+00',25,null),
  ('bk_qw_005','biz_queenwest','cus_qw_0078','Jamal Adams','svc_qw_beard','Completed','done','2026-05-27 13:15:00+00',20,null),
  ('bk_qw_006','biz_queenwest','cus_qw_0024','Devon Reid','svc_qw_buzz','Completed','done','2026-05-26 15:15:00+00',25,null),
  ('bk_qw_007','biz_queenwest','cus_qw_0072','Maya Morin','svc_qw_kids','May 22','cancelled','2026-05-28 17:30:00+00',25,'Cancelled by salon'),
  ('bk_qw_008','biz_queenwest','cus_qw_0092','Nathan Romano','svc_qw_shave','May 12','cancelled','2026-05-08 17:45:00+00',35,'Cancelled by salon'),
  ('bk_qw_009','biz_queenwest','cus_qw_0040','Ethan Roy','svc_qw_kids','May 13','cancelled','2026-05-09 10:45:00+00',25,'Cancelled by salon'),
  ('bk_qw_010','biz_queenwest','cus_qw_0057','Mateo Wang','svc_qw_buzz','May 11','cancelled','2026-05-09 14:30:00+00',25,'Cancelled by salon'),
  ('bk_qw_011','biz_queenwest','cus_qw_0048','Leah Pham','svc_qw_shave','May 17','cancelled','2026-05-11 18:45:00+00',35,'Cancelled by salon'),
  ('bk_qw_012','biz_queenwest','cus_qw_0120','Anton Murphy','svc_qw_kids','May 2','cancelled','2026-05-20 11:15:00+00',25,'Cancelled by salon'),
  ('bk_qw_013','biz_queenwest','cus_qw_0039','Jamal Park','svc_qw_wash','May 19','cancelled','2026-05-08 12:45:00+00',40,'Cancelled by salon'),
  ('bk_qw_014','biz_queenwest','cus_qw_0116','Jada Patel','svc_qw_lineup','May 16','cancelled','2026-05-28 10:30:00+00',15,'Cancelled by salon'),
  ('bk_qw_015','biz_queenwest','cus_qw_0109','Hannah Walsh','svc_qw_fade','May 8','cancelled','2026-05-17 10:45:00+00',40,'Cancelled by salon'),
  ('bk_qw_016','biz_queenwest','cus_qw_0025','Andre Reid','svc_qw_buzz','May 22','cancelled','2026-05-28 17:30:00+00',25,'Cancelled by salon'),
  ('bk_qw_017','biz_queenwest','cus_qw_0081','Owen Murphy','svc_qw_shave','May 11','cancelled','2026-05-14 10:30:00+00',35,'Cancelled by salon'),
  ('bk_qw_018','biz_queenwest','cus_qw_0103','Hassan Rossi','svc_qw_beard','May 20','cancelled','2026-05-02 14:00:00+00',20,'Cancelled by salon'),
  ('bk_qw_019','biz_queenwest','cus_qw_0017','Jack Brown','svc_qw_fade','May 13','cancelled','2026-05-13 12:15:00+00',40,'Cancelled by salon'),
  ('bk_qw_020','biz_queenwest','cus_qw_0087','Kofi Kim','svc_qw_wash','May 28','cancelled','2026-05-05 14:15:00+00',40,'Cancelled by salon'),
  ('bk_qw_021','biz_queenwest','cus_qw_0014','Jada Clark','svc_qw_lineup','May 28','cancelled','2026-05-02 11:45:00+00',15,'Cancelled by salon'),
  ('bk_qw_022','biz_queenwest','cus_qw_0114','Jada Mensah','svc_qw_wash','May 23','cancelled','2026-05-19 14:30:00+00',40,'Cancelled by salon'),
  ('bk_qw_023','biz_queenwest','cus_qw_0091','Hannah Lavigne','svc_qw_classic','May 9','cancelled','2026-05-17 15:00:00+00',35,'Cancelled by salon'),
  ('bk_qw_024','biz_queenwest','cus_qw_0101','Raj Mensah','svc_qw_lineup','May 23','cancelled','2026-05-14 16:45:00+00',15,'no-show'),
  ('bk_qw_025','biz_queenwest','cus_qw_0009','Elias Khoury','svc_qw_lineup','May 11','cancelled','2026-05-02 18:00:00+00',15,'no-show'),
  ('bk_qw_026','biz_queenwest','cus_qw_0021','Malik Wilson','svc_qw_shave','May 7','cancelled','2026-05-06 17:00:00+00',35,'no-show'),
  ('bk_qw_027','biz_queenwest','cus_qw_0058','Omar Li','svc_qw_kids','May 27','cancelled','2026-05-02 10:15:00+00',25,'no-show'),
  ('bk_qw_028','biz_queenwest','cus_qw_0093','Nina Tran','svc_qw_classic','May 2','cancelled','2026-05-26 12:15:00+00',35,'no-show'),
  ('bk_qw_029','biz_queenwest','cus_qw_0069','Theo Lavigne','svc_qw_wash','May 15','cancelled','2026-05-12 11:45:00+00',40,'no-show'),
  ('bk_qw_030','biz_queenwest','cus_qw_0013','Zoe Roy','svc_qw_buzz','May 19','cancelled','2026-05-16 11:45:00+00',25,'no-show'),
  ('bk_qw_031','biz_queenwest','cus_qw_0100','Daniel Singh','svc_qw_beard','Completed','done','2026-06-14 14:15:00+00',20,null),
  ('bk_qw_032','biz_queenwest','cus_qw_0058','Omar Li','svc_qw_buzz','Completed','done','2026-06-04 11:15:00+00',25,null),
  ('bk_qw_033','biz_queenwest','cus_qw_0098','Amara Wang','svc_qw_wash','Completed','done','2026-06-10 17:15:00+00',40,null),
  ('bk_qw_034','biz_queenwest','cus_qw_0104','Raj Tremblay','svc_qw_buzz','Completed','done','2026-06-20 12:00:00+00',25,null),
  ('bk_qw_035','biz_queenwest','cus_qw_0052','Dmitri Murphy','svc_qw_lineup','Completed','done','2026-06-21 12:45:00+00',15,null),
  ('bk_qw_036','biz_queenwest','cus_qw_0019','Omar Khoury','svc_qw_shave','Completed','done','2026-06-04 09:45:00+00',35,null),
  ('bk_qw_037','biz_queenwest','cus_qw_0087','Kofi Kim','svc_qw_grey','Completed','done','2026-06-22 10:30:00+00',45,null),
  ('bk_qw_038','biz_queenwest','cus_qw_0032','Oscar Tremblay','svc_qw_fade','Completed','done','2026-06-12 17:15:00+00',40,null),
  ('bk_qw_039','biz_queenwest','cus_qw_0006','Nina Pham','svc_qw_grey','Completed','done','2026-06-05 17:30:00+00',45,null),
  ('bk_qw_040','biz_queenwest','cus_qw_0075','Emma Bouchard','svc_qw_wash','Completed','done','2026-06-05 17:00:00+00',40,null),
  ('bk_qw_041','biz_queenwest','cus_qw_0041','Olivia Wang','svc_qw_shave','Completed','done','2026-06-01 17:15:00+00',35,null),
  ('bk_qw_042','biz_queenwest','cus_qw_0033','Tyler Singh','svc_qw_kids','Completed','done','2026-06-18 11:00:00+00',25,null),
  ('bk_qw_043','biz_queenwest','cus_qw_0122','Hugo Murphy','svc_qw_grey','Completed','done','2026-06-12 14:00:00+00',45,null),
  ('bk_qw_044','biz_queenwest','cus_qw_0085','Omar Murphy','svc_qw_buzz','Completed','done','2026-06-18 10:45:00+00',25,null),
  ('bk_qw_045','biz_queenwest','cus_qw_0096','Noah Haddad','svc_qw_grey','Completed','done','2026-06-09 12:00:00+00',45,null),
  ('bk_qw_046','biz_queenwest','cus_qw_0081','Owen Murphy','svc_qw_grey','Completed','done','2026-06-09 12:30:00+00',45,null),
  ('bk_qw_047','biz_queenwest','cus_qw_0016','Leah Adams','svc_qw_kids','Completed','done','2026-06-20 14:00:00+00',25,null),
  ('bk_qw_048','biz_queenwest','cus_qw_0022','Owen Kim','svc_qw_shave','Completed','done','2026-06-04 15:45:00+00',35,null),
  ('bk_qw_049','biz_queenwest','cus_qw_0013','Zoe Roy','svc_qw_fade','Completed','done','2026-06-13 14:00:00+00',40,null),
  ('bk_qw_050','biz_queenwest','cus_qw_0076','Kofi Khoury','svc_qw_buzz','Completed','done','2026-06-03 14:30:00+00',25,null),
  ('bk_qw_051','biz_queenwest','cus_qw_0086','Sophia Gagnon','svc_qw_fade','Completed','done','2026-06-07 18:30:00+00',40,null),
  ('bk_qw_052','biz_queenwest','cus_qw_0027','Anton Nguyen','svc_qw_classic','Completed','done','2026-06-11 15:45:00+00',35,null),
  ('bk_qw_053','biz_queenwest','cus_qw_0026','Mateo Kelly','svc_qw_fade','Completed','done','2026-06-22 11:00:00+00',40,null),
  ('bk_qw_054','biz_queenwest','cus_qw_0044','Logan Chen','svc_qw_shave','Completed','done','2026-06-08 10:15:00+00',35,null),
  ('bk_qw_055','biz_queenwest','cus_qw_0105','Liam Osei','svc_qw_classic','Completed','done','2026-06-07 13:15:00+00',35,null),
  ('bk_qw_056','biz_queenwest','cus_qw_0002','Malik Brown','svc_qw_grey','Completed','done','2026-06-07 11:45:00+00',45,null),
  ('bk_qw_057','biz_queenwest','cus_qw_0011','Chen Haddad','svc_qw_shave','Completed','done','2026-06-13 15:45:00+00',35,null),
  ('bk_qw_058','biz_queenwest','cus_qw_0023','Marcus Brown','svc_qw_kids','Completed','done','2026-06-14 13:45:00+00',25,null),
  ('bk_qw_059','biz_queenwest','cus_qw_0020','Ethan Osei','svc_qw_buzz','Completed','done','2026-06-08 18:00:00+00',25,null),
  ('bk_qw_060','biz_queenwest','cus_qw_0107','Jamal Tran','svc_qw_grey','Completed','done','2026-06-19 11:45:00+00',45,null),
  ('bk_qw_061','biz_queenwest','cus_qw_0005','Dmitri Gagnon','svc_qw_wash','9:00 AM','scheduled','2026-06-23 09:00:00+00',40,null),
  ('bk_qw_062','biz_queenwest','cus_qw_0094','Chen Osei','svc_qw_shave','11:30 AM','scheduled','2026-06-23 11:00:00+00',35,null),
  ('bk_qw_063','biz_queenwest','cus_qw_0064','Emma Khoury','svc_qw_buzz','2:00 PM','scheduled','2026-06-23 14:00:00+00',25,null),
  ('bk_qw_064','biz_queenwest','cus_qw_0029','Diego Morin','svc_qw_beard','5:00 PM','scheduled','2026-06-23 17:00:00+00',20,null),
  ('bk_qw_065','biz_queenwest','cus_qw_0062','Raj Kelly','svc_qw_kids','10:00 AM','scheduled','2026-06-24 10:00:00+00',25,null),
  ('bk_qw_066','biz_queenwest','cus_qw_0111','Caleb Khoury','svc_qw_kids','1:00 PM','scheduled','2026-06-24 13:00:00+00',25,null),
  ('bk_qw_067','biz_queenwest','cus_qw_0059','Jack Clark','svc_qw_buzz','4:30 PM','scheduled','2026-06-24 16:00:00+00',25,null),
  ('bk_qw_068','biz_queenwest','cus_qw_0115','Omar Romano','svc_qw_cutbeard','9:00 AM','scheduled','2026-06-25 09:00:00+00',50,null),
  ('bk_qw_069','biz_queenwest','cus_qw_0093','Nina Tran','svc_qw_cutbeard','12:00 PM','scheduled','2026-06-25 12:00:00+00',50,null),
  ('bk_qw_070','biz_queenwest','cus_qw_0042','Vikram Kaur','svc_qw_grey','3:00 PM','scheduled','2026-06-26 15:00:00+00',45,null),
  ('bk_qw_071','biz_queenwest','cus_qw_0001','Priya Tremblay','svc_qw_cutbeard','6:00 PM','scheduled','2026-06-26 18:00:00+00',50,null),
  ('bk_qw_072','biz_queenwest','cus_qw_0068','Mason Wang','svc_qw_cutbeard','10:00 AM','scheduled','2026-06-27 10:00:00+00',50,null),
  ('bk_qw_073','biz_queenwest','cus_qw_0034','Priya Clark','svc_qw_grey','2:00 PM','scheduled','2026-06-27 14:00:00+00',45,null),
  ('bk_qw_074','biz_queenwest','cus_qw_0036','Marcus Nguyen','svc_qw_grey','6:00 PM','scheduled','2026-06-23 18:00:00+00',45,null),
  ('bk_qw_075','biz_queenwest','cus_qw_0067','Liam Tran','svc_qw_shave','June 20','cancelled','2026-06-07 17:15:00+00',35,'no-show'),
  ('bk_qw_076','biz_queenwest','cus_qw_0055','Hannah Kim','svc_qw_fade','June 13','cancelled','2026-06-03 13:30:00+00',40,'no-show'),
  ('bk_qw_077','biz_queenwest','cus_qw_0108','Maya Murphy','svc_qw_kids','June 17','cancelled','2026-06-15 13:15:00+00',25,'no-show'),
  ('bk_qw_078','biz_queenwest','cus_qw_0103','Hassan Rossi','svc_qw_kids','June 10','cancelled','2026-06-16 15:45:00+00',25,'no-show');

insert into messages (id, business_id, customer_id, message_type, body, status, sent_at) values
  ('msg_qw_0001','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-05-07 15:00:00+00'),
  ('msg_qw_0002','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-05-08 17:00:00+00'),
  ('msg_qw_0003','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-05-21 15:00:00+00'),
  ('msg_qw_0004','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-05-17 14:00:00+00'),
  ('msg_qw_0005','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-05-06 18:00:00+00'),
  ('msg_qw_0006','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-05-15 19:00:00+00'),
  ('msg_qw_0007','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-05-13 19:00:00+00'),
  ('msg_qw_0008','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-05-26 12:00:00+00'),
  ('msg_qw_0009','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-05-21 09:00:00+00'),
  ('msg_qw_0010','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-05-03 19:00:00+00'),
  ('msg_qw_0011','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-05-20 17:00:00+00'),
  ('msg_qw_0012','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-05-27 15:00:00+00'),
  ('msg_qw_0013','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-05-16 09:00:00+00'),
  ('msg_qw_0014','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-05-12 11:00:00+00'),
  ('msg_qw_0015','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-10 17:00:00+00'),
  ('msg_qw_0016','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-05 19:00:00+00'),
  ('msg_qw_0017','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-18 13:00:00+00'),
  ('msg_qw_0018','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-14 15:00:00+00'),
  ('msg_qw_0019','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-12 09:00:00+00'),
  ('msg_qw_0020','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-08 09:00:00+00'),
  ('msg_qw_0021','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-21 18:00:00+00'),
  ('msg_qw_0022','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-04 15:00:00+00'),
  ('msg_qw_0023','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-02 11:00:00+00'),
  ('msg_qw_0024','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-13 13:00:00+00'),
  ('msg_qw_0025','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-07 13:00:00+00'),
  ('msg_qw_0026','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-12 14:00:00+00'),
  ('msg_qw_0027','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-06 10:00:00+00'),
  ('msg_qw_0028','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-11 13:00:00+00'),
  ('msg_qw_0029','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-18 15:00:00+00'),
  ('msg_qw_0030','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-10 16:00:00+00'),
  ('msg_qw_0031','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-05 13:00:00+00'),
  ('msg_qw_0032','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-12 10:00:00+00'),
  ('msg_qw_0033','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-17 10:00:00+00'),
  ('msg_qw_0034','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-13 19:00:00+00'),
  ('msg_qw_0035','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-17 17:00:00+00'),
  ('msg_qw_0036','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-08 14:00:00+00'),
  ('msg_qw_0037','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-22 13:00:00+00'),
  ('msg_qw_0038','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-15 17:00:00+00'),
  ('msg_qw_0039','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-16 14:00:00+00'),
  ('msg_qw_0040','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-05 17:00:00+00'),
  ('msg_qw_0041','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-18 09:00:00+00'),
  ('msg_qw_0042','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-08 13:00:00+00'),
  ('msg_qw_0043','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-07 11:00:00+00'),
  ('msg_qw_0044','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-15 14:00:00+00'),
  ('msg_qw_0045','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-12 15:00:00+00'),
  ('msg_qw_0046','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-05 19:00:00+00'),
  ('msg_qw_0047','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-02 10:00:00+00'),
  ('msg_qw_0048','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-12 10:00:00+00'),
  ('msg_qw_0049','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-13 10:00:00+00'),
  ('msg_qw_0050','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-14 09:00:00+00'),
  ('msg_qw_0051','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-07 14:00:00+00'),
  ('msg_qw_0052','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-04 14:00:00+00'),
  ('msg_qw_0053','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-08 18:00:00+00'),
  ('msg_qw_0054','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-11 10:00:00+00'),
  ('msg_qw_0055','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-21 11:00:00+00'),
  ('msg_qw_0056','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-12 15:00:00+00'),
  ('msg_qw_0057','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-03 10:00:00+00'),
  ('msg_qw_0058','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-02 16:00:00+00'),
  ('msg_qw_0059','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-03 16:00:00+00'),
  ('msg_qw_0060','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-18 17:00:00+00'),
  ('msg_qw_0061','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-01 18:00:00+00'),
  ('msg_qw_0062','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-02 12:00:00+00'),
  ('msg_qw_0063','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-15 10:00:00+00'),
  ('msg_qw_0064','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-03 10:00:00+00'),
  ('msg_qw_0065','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-19 10:00:00+00'),
  ('msg_qw_0066','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-15 15:00:00+00'),
  ('msg_qw_0067','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-04 18:00:00+00'),
  ('msg_qw_0068','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-01 15:00:00+00'),
  ('msg_qw_0069','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-04 14:00:00+00'),
  ('msg_qw_0070','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-05 12:00:00+00'),
  ('msg_qw_0071','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-01 19:00:00+00'),
  ('msg_qw_0072','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-15 11:00:00+00'),
  ('msg_qw_0073','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-13 11:00:00+00'),
  ('msg_qw_0074','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-16 13:00:00+00'),
  ('msg_qw_0075','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-08 19:00:00+00'),
  ('msg_qw_0076','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-19 12:00:00+00'),
  ('msg_qw_0077','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-13 13:00:00+00'),
  ('msg_qw_0078','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-06 18:00:00+00'),
  ('msg_qw_0079','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-04 15:00:00+00'),
  ('msg_qw_0080','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-20 10:00:00+00'),
  ('msg_qw_0081','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-10 13:00:00+00'),
  ('msg_qw_0082','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-01 17:00:00+00'),
  ('msg_qw_0083','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-16 13:00:00+00'),
  ('msg_qw_0084','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-20 16:00:00+00'),
  ('msg_qw_0085','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-12 14:00:00+00'),
  ('msg_qw_0086','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-10 16:00:00+00'),
  ('msg_qw_0087','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-08 13:00:00+00'),
  ('msg_qw_0088','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-16 14:00:00+00'),
  ('msg_qw_0089','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-03 16:00:00+00'),
  ('msg_qw_0090','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-15 13:00:00+00'),
  ('msg_qw_0091','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-08 15:00:00+00'),
  ('msg_qw_0092','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-06 16:00:00+00'),
  ('msg_qw_0093','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-09 10:00:00+00'),
  ('msg_qw_0094','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-12 14:00:00+00'),
  ('msg_qw_0095','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-17 18:00:00+00'),
  ('msg_qw_0096','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-13 19:00:00+00'),
  ('msg_qw_0097','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-20 18:00:00+00'),
  ('msg_qw_0098','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-03 17:00:00+00'),
  ('msg_qw_0099','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-08 09:00:00+00'),
  ('msg_qw_0100','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-02 18:00:00+00'),
  ('msg_qw_0101','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-21 12:00:00+00'),
  ('msg_qw_0102','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-13 13:00:00+00'),
  ('msg_qw_0103','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-11 14:00:00+00'),
  ('msg_qw_0104','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-11 11:00:00+00'),
  ('msg_qw_0105','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-02 09:00:00+00'),
  ('msg_qw_0106','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-09 11:00:00+00'),
  ('msg_qw_0107','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-17 10:00:00+00'),
  ('msg_qw_0108','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-10 19:00:00+00'),
  ('msg_qw_0109','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-20 16:00:00+00'),
  ('msg_qw_0110','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-18 11:00:00+00'),
  ('msg_qw_0111','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-05 18:00:00+00'),
  ('msg_qw_0112','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-09 12:00:00+00'),
  ('msg_qw_0113','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-19 10:00:00+00'),
  ('msg_qw_0114','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-21 15:00:00+00'),
  ('msg_qw_0115','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-12 09:00:00+00'),
  ('msg_qw_0116','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-13 19:00:00+00'),
  ('msg_qw_0117','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-03 14:00:00+00'),
  ('msg_qw_0118','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-11 18:00:00+00'),
  ('msg_qw_0119','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-12 11:00:00+00'),
  ('msg_qw_0120','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-09 18:00:00+00'),
  ('msg_qw_0121','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-12 09:00:00+00'),
  ('msg_qw_0122','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-04 11:00:00+00'),
  ('msg_qw_0123','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-08 17:00:00+00'),
  ('msg_qw_0124','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-09 14:00:00+00'),
  ('msg_qw_0125','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-14 18:00:00+00'),
  ('msg_qw_0126','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-09 17:00:00+00'),
  ('msg_qw_0127','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-17 18:00:00+00'),
  ('msg_qw_0128','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-18 09:00:00+00'),
  ('msg_qw_0129','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-02 18:00:00+00'),
  ('msg_qw_0130','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-13 13:00:00+00'),
  ('msg_qw_0131','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-06 14:00:00+00'),
  ('msg_qw_0132','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-03 19:00:00+00'),
  ('msg_qw_0133','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-17 13:00:00+00'),
  ('msg_qw_0134','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-15 18:00:00+00'),
  ('msg_qw_0135','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-17 17:00:00+00'),
  ('msg_qw_0136','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-08 18:00:00+00'),
  ('msg_qw_0137','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-11 19:00:00+00'),
  ('msg_qw_0138','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-01 11:00:00+00'),
  ('msg_qw_0139','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-12 12:00:00+00'),
  ('msg_qw_0140','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-19 16:00:00+00'),
  ('msg_qw_0141','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-12 14:00:00+00'),
  ('msg_qw_0142','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-01 12:00:00+00'),
  ('msg_qw_0143','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-17 18:00:00+00'),
  ('msg_qw_0144','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-14 16:00:00+00');

insert into referrals (id, business_id, referrer_customer_id, referred_customer_id, referral_code, status) values
  ('ref_qw_001','biz_queenwest','cus_qw_0055','cus_qw_0025','HANNA','completed'),
  ('ref_qw_002','biz_queenwest','cus_qw_0061','cus_qw_0099','LIAM','completed'),
  ('ref_qw_003','biz_queenwest','cus_qw_0020','cus_qw_0052','ETHAN1','completed'),
  ('ref_qw_004','biz_queenwest','cus_qw_0056','cus_qw_0075','KWAME','completed'),
  ('ref_qw_005','biz_queenwest','cus_qw_0063','cus_qw_0093','MALIK2','completed'),
  ('ref_qw_006','biz_queenwest','cus_qw_0032','cus_qw_0065','OSCAR','completed'),
  ('ref_qw_007','biz_queenwest','cus_qw_0038','cus_qw_0011','DANIE','completed'),
  ('ref_qw_008','biz_queenwest','cus_qw_0035','cus_qw_0097','TYLER1','completed'),
  ('ref_qw_009','biz_queenwest','cus_qw_0041','cus_qw_0101','OLIVI','completed'),
  ('ref_qw_010','biz_queenwest','cus_qw_0062','cus_qw_0042','RAJ','completed');

