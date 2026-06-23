-- Queen West Barber Co. — service menu fix.
-- Ensures the columns exist, then loads the 10 services. Safe to re-run.
alter table services add column if not exists category text not null default 'Other';
alter table services add column if not exists duration_min int not null default 45;

insert into services (id, business_id, category, name, price, duration_min) values
  ('svc_qw_fade',     'biz_queenwest', 'Hair',   'Skin Fade',       40, 45),
  ('svc_qw_classic',  'biz_queenwest', 'Hair',   'Classic Cut',     35, 30),
  ('svc_qw_cutbeard', 'biz_queenwest', 'Hair',   'Cut & Beard',     50, 45),
  ('svc_qw_beard',    'biz_queenwest', 'Barber', 'Beard Trim',      20, 20),
  ('svc_qw_shave',    'biz_queenwest', 'Barber', 'Hot Towel Shave', 35, 30),
  ('svc_qw_kids',     'biz_queenwest', 'Hair',   'Kids Cut',        25, 30),
  ('svc_qw_buzz',     'biz_queenwest', 'Hair',   'Buzz Cut',        25, 20),
  ('svc_qw_wash',     'biz_queenwest', 'Hair',   'Cut & Wash',      40, 40),
  ('svc_qw_grey',     'biz_queenwest', 'Hair',   'Grey Blending',   45, 45),
  ('svc_qw_lineup',   'biz_queenwest', 'Barber', 'Line-up',         15, 15)
on conflict (id) do nothing;
