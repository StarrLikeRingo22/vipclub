-- ──────────────────────────────────────────────────────────────
-- VIP Club — demo seed (test accounts + sample clients)
-- Run AFTER db/schema.sql. Safe to re-run (on conflict do nothing).
-- Loads the same test owner/staff/admin logins and a handful of demo
-- clients so the dashboard is populated when you sign in.
--
-- Logins (password for all: vip12345):
--   owner@bella.test  · staff@bella.test  · admin@vipclub.test
-- These rows have a null password_hash; the app accepts the demo
-- password for them. Real staff added in-app get a hashed password.
-- ──────────────────────────────────────────────────────────────

-- Make sure the demo business exists (also seeded by schema.sql).
insert into businesses (id, business_name, business_type, booking_url, reward_threshold, default_reminder_days, twilio_number)
values ('biz_bella', 'Bella Beauty Studio', 'Hair, Nails & Brows', 'https://book.example.com/bella', 5, 35, '+14155550147')
on conflict (id) do nothing;

-- ── Test accounts ───────────────────────────────────────────────
insert into users (id, business_id, name, email, role, password_hash) values
  ('usr_owner','biz_bella','Bella Nguyen','owner@bella.test','owner', null),
  ('usr_staff','biz_bella','Tara Stylist','staff@bella.test','staff', null),
  ('usr_admin', null,'Platform Admin','admin@vipclub.test','admin', null)
on conflict (id) do nothing;

-- ── Sample clients ──────────────────────────────────────────────
insert into customers
  (id, business_id, full_name, phone, email, birthday, consent_sms, status, customer_code, visit_count, points_balance, last_visit_date, reward_status, created_at)
values
  ('cus_sophia',  'biz_bella','Sophia Bennett','+14155550192','sophia@example.com','06-14', true, 'active',   'SOPHIA2048', 4, 4, now() - interval '24 days', 'earning', now() - interval '100 days'),
  ('cus_maya',    'biz_bella','Maya Rodriguez','+14155550150', null,               null,    true, 'active',   'MAYA5150',   5, 5, now() - interval '10 days', 'ready',   now() - interval '120 days'),
  ('cus_amara',   'biz_bella','Amara Lewis',   '+14155550134', null,               null,    true, 'inactive', 'AMARA3134',  2, 2, now() - interval '41 days', 'earning', now() - interval '160 days'),
  ('cus_jasmine', 'biz_bella','Jasmine Khan',  '+14155550148','jas@example.com',   null,    true, 'active',   'JASMIN0148', 2, 2, now() - interval '6 days',  'earning', now() - interval '8 days'),
  ('cus_elena',   'biz_bella','Elena Torres',  '+14155550177', null,               null,    true, 'active',   'ELENA0177',  3, 3, now() - interval '15 days', 'earning', now() - interval '70 days'),
  ('cus_nadia',   'biz_bella','Nadia Park',    '+14155550199', null,               null,    true, 'inactive', 'NADIA0199',  1, 1, now() - interval '58 days', 'earning', now() - interval '90 days')
on conflict (id) do nothing;

-- ── Sample appointments for today ───────────────────────────────
insert into bookings (id, business_id, customer_id, customer_name, service_id, time_label, status, starts_at, duration_min)
values
  ('bk_1','biz_bella','cus_sophia','Sophia Bennett','svc_wcut',   '9:00 AM',  'scheduled', now() + interval '2 hours', 45),
  ('bk_2','biz_bella','cus_jasmine','Jasmine Khan',  'svc_gelmani','10:30 AM', 'scheduled', now() + interval '4 hours', 45),
  ('bk_3','biz_bella','cus_elena','Elena Torres',    'svc_blow',   '11:15 AM', 'scheduled', now() + interval '5 hours', 45),
  ('bk_4','biz_bella','cus_maya','Maya Rodriguez',   'svc_color',  '1:00 PM',  'scheduled', now() + interval '7 hours', 90),
  ('bk_5','biz_bella','cus_nadia','Nadia Park',      'svc_lashfill','2:30 PM', 'scheduled', now() + interval '8 hours', 60),
  ('bk_6','biz_bella','cus_amara','Amara Lewis',     'svc_pedi',   '4:00 PM',  'scheduled', now() + interval '10 hours', 45)
on conflict (id) do nothing;
