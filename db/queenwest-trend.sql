-- =================================================================
-- VIP Club -- Queen West Barber Co.: slow May -> trending June
-- Resets ONLY this business's transactions and re-seeds the story.
-- Run AFTER queenwest-setup.sql. Safe to re-run. biz_queenwest only.
-- =================================================================

delete from visits    where business_id='biz_queenwest';
delete from messages  where business_id='biz_queenwest';
delete from referrals where business_id='biz_queenwest';
delete from bookings  where business_id='biz_queenwest';

insert into visits (id, business_id, customer_id, service_id, service_name, amount_spent, points_added, source, visit_date, created_at) values
  ('vis_qw_0001','biz_queenwest','cus_qw_0090','svc_qw_kids','Kids Cut',25,1,'booking','2026-05-19 11:00:00+00','2026-05-19 11:00:00+00'),
  ('vis_qw_0002','biz_queenwest','cus_qw_0066','svc_qw_lineup','Line-up',15,1,'booking','2026-05-04 14:30:00+00','2026-05-04 14:30:00+00'),
  ('vis_qw_0003','biz_queenwest','cus_qw_0068','svc_qw_beard','Beard Trim',20,1,'booking','2026-05-06 13:45:00+00','2026-05-06 13:45:00+00'),
  ('vis_qw_0004','biz_queenwest','cus_qw_0108','svc_qw_kids','Kids Cut',25,1,'booking','2026-05-23 17:15:00+00','2026-05-23 17:15:00+00'),
  ('vis_qw_0005','biz_queenwest','cus_qw_0018','svc_qw_beard','Beard Trim',20,1,'booking','2026-05-08 14:45:00+00','2026-05-08 14:45:00+00'),
  ('vis_qw_0006','biz_queenwest','cus_qw_0104','svc_qw_lineup','Line-up',15,1,'booking','2026-05-11 10:15:00+00','2026-05-11 10:15:00+00'),
  ('vis_qw_0007','biz_queenwest','cus_qw_0061','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-05-16 11:15:00+00','2026-05-16 11:15:00+00'),
  ('vis_qw_0008','biz_queenwest','cus_qw_0087','svc_qw_beard','Beard Trim',20,1,'booking','2026-05-11 13:15:00+00','2026-05-11 13:15:00+00'),
  ('vis_qw_0009','biz_queenwest','cus_qw_0106','svc_qw_kids','Kids Cut',25,1,'booking','2026-05-21 17:45:00+00','2026-05-21 17:45:00+00'),
  ('vis_qw_0010','biz_queenwest','cus_qw_0007','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-05-23 15:30:00+00','2026-05-23 15:30:00+00'),
  ('vis_qw_0011','biz_queenwest','cus_qw_0050','svc_qw_kids','Kids Cut',25,1,'booking','2026-05-17 15:15:00+00','2026-05-17 15:15:00+00'),
  ('vis_qw_0012','biz_queenwest','cus_qw_0072','svc_qw_lineup','Line-up',15,1,'booking','2026-05-13 17:45:00+00','2026-05-13 17:45:00+00'),
  ('vis_qw_0013','biz_queenwest','cus_qw_0042','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-10 13:15:00+00','2026-06-10 13:15:00+00'),
  ('vis_qw_0014','biz_queenwest','cus_qw_0042','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-09 17:45:00+00','2026-06-09 17:45:00+00'),
  ('vis_qw_0015','biz_queenwest','cus_qw_0119','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-09 09:45:00+00','2026-06-09 09:45:00+00'),
  ('vis_qw_0016','biz_queenwest','cus_qw_0106','svc_qw_lineup','Line-up',15,1,'booking','2026-06-07 12:00:00+00','2026-06-07 12:00:00+00'),
  ('vis_qw_0017','biz_queenwest','cus_qw_0043','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-20 10:30:00+00','2026-06-20 10:30:00+00'),
  ('vis_qw_0018','biz_queenwest','cus_qw_0029','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-11 09:15:00+00','2026-06-11 09:15:00+00'),
  ('vis_qw_0019','biz_queenwest','cus_qw_0052','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-05 18:00:00+00','2026-06-05 18:00:00+00'),
  ('vis_qw_0020','biz_queenwest','cus_qw_0073','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-03 16:30:00+00','2026-06-03 16:30:00+00'),
  ('vis_qw_0021','biz_queenwest','cus_qw_0073','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-16 10:00:00+00','2026-06-16 10:00:00+00'),
  ('vis_qw_0022','biz_queenwest','cus_qw_0051','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-08 09:15:00+00','2026-06-08 09:15:00+00'),
  ('vis_qw_0023','biz_queenwest','cus_qw_0064','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-20 14:30:00+00','2026-06-20 14:30:00+00'),
  ('vis_qw_0024','biz_queenwest','cus_qw_0065','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-12 11:45:00+00','2026-06-12 11:45:00+00'),
  ('vis_qw_0025','biz_queenwest','cus_qw_0065','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-10 11:45:00+00','2026-06-10 11:45:00+00'),
  ('vis_qw_0026','biz_queenwest','cus_qw_0012','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-22 15:00:00+00','2026-06-22 15:00:00+00'),
  ('vis_qw_0027','biz_queenwest','cus_qw_0068','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-21 15:00:00+00','2026-06-21 15:00:00+00'),
  ('vis_qw_0028','biz_queenwest','cus_qw_0041','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-04 11:15:00+00','2026-06-04 11:15:00+00'),
  ('vis_qw_0029','biz_queenwest','cus_qw_0113','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-07 16:15:00+00','2026-06-07 16:15:00+00'),
  ('vis_qw_0030','biz_queenwest','cus_qw_0104','svc_qw_lineup','Line-up',15,1,'booking','2026-06-10 13:45:00+00','2026-06-10 13:45:00+00'),
  ('vis_qw_0031','biz_queenwest','cus_qw_0089','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-16 15:00:00+00','2026-06-16 15:00:00+00'),
  ('vis_qw_0032','biz_queenwest','cus_qw_0009','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-19 09:45:00+00','2026-06-19 09:45:00+00'),
  ('vis_qw_0033','biz_queenwest','cus_qw_0001','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-16 13:00:00+00','2026-06-16 13:00:00+00'),
  ('vis_qw_0034','biz_queenwest','cus_qw_0028','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-17 15:30:00+00','2026-06-17 15:30:00+00'),
  ('vis_qw_0035','biz_queenwest','cus_qw_0028','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-13 11:15:00+00','2026-06-13 11:15:00+00'),
  ('vis_qw_0036','biz_queenwest','cus_qw_0015','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-09 11:15:00+00','2026-06-09 11:15:00+00'),
  ('vis_qw_0037','biz_queenwest','cus_qw_0019','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-17 09:45:00+00','2026-06-17 09:45:00+00'),
  ('vis_qw_0038','biz_queenwest','cus_qw_0019','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-14 12:15:00+00','2026-06-14 12:15:00+00'),
  ('vis_qw_0039','biz_queenwest','cus_qw_0047','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-17 12:00:00+00','2026-06-17 12:00:00+00'),
  ('vis_qw_0040','biz_queenwest','cus_qw_0047','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-17 15:00:00+00','2026-06-17 15:00:00+00'),
  ('vis_qw_0041','biz_queenwest','cus_qw_0018','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-01 16:00:00+00','2026-06-01 16:00:00+00'),
  ('vis_qw_0042','biz_queenwest','cus_qw_0010','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-03 10:00:00+00','2026-06-03 10:00:00+00'),
  ('vis_qw_0043','biz_queenwest','cus_qw_0033','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-01 12:45:00+00','2026-06-01 12:45:00+00'),
  ('vis_qw_0044','biz_queenwest','cus_qw_0055','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-13 13:30:00+00','2026-06-13 13:30:00+00'),
  ('vis_qw_0045','biz_queenwest','cus_qw_0092','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-17 15:45:00+00','2026-06-17 15:45:00+00'),
  ('vis_qw_0046','biz_queenwest','cus_qw_0017','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-13 10:00:00+00','2026-06-13 10:00:00+00'),
  ('vis_qw_0047','biz_queenwest','cus_qw_0087','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-16 09:45:00+00','2026-06-16 09:45:00+00'),
  ('vis_qw_0048','biz_queenwest','cus_qw_0014','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-16 17:30:00+00','2026-06-16 17:30:00+00'),
  ('vis_qw_0049','biz_queenwest','cus_qw_0063','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-22 10:30:00+00','2026-06-22 10:30:00+00'),
  ('vis_qw_0050','biz_queenwest','cus_qw_0063','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-01 12:00:00+00','2026-06-01 12:00:00+00'),
  ('vis_qw_0051','biz_queenwest','cus_qw_0025','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-19 16:00:00+00','2026-06-19 16:00:00+00'),
  ('vis_qw_0052','biz_queenwest','cus_qw_0097','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-10 17:30:00+00','2026-06-10 17:30:00+00'),
  ('vis_qw_0053','biz_queenwest','cus_qw_0034','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-14 10:30:00+00','2026-06-14 10:30:00+00'),
  ('vis_qw_0054','biz_queenwest','cus_qw_0034','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-14 15:30:00+00','2026-06-14 15:30:00+00'),
  ('vis_qw_0055','biz_queenwest','cus_qw_0084','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-03 12:15:00+00','2026-06-03 12:15:00+00'),
  ('vis_qw_0056','biz_queenwest','cus_qw_0053','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-05 15:30:00+00','2026-06-05 15:30:00+00'),
  ('vis_qw_0057','biz_queenwest','cus_qw_0105','svc_qw_lineup','Line-up',15,1,'booking','2026-06-08 09:15:00+00','2026-06-08 09:15:00+00'),
  ('vis_qw_0058','biz_queenwest','cus_qw_0058','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-18 18:30:00+00','2026-06-18 18:30:00+00'),
  ('vis_qw_0059','biz_queenwest','cus_qw_0069','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-12 16:45:00+00','2026-06-12 16:45:00+00'),
  ('vis_qw_0060','biz_queenwest','cus_qw_0030','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-09 14:30:00+00','2026-06-09 14:30:00+00'),
  ('vis_qw_0061','biz_queenwest','cus_qw_0044','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-08 10:45:00+00','2026-06-08 10:45:00+00'),
  ('vis_qw_0062','biz_queenwest','cus_qw_0044','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-05 13:45:00+00','2026-06-05 13:45:00+00'),
  ('vis_qw_0063','biz_queenwest','cus_qw_0026','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-03 09:45:00+00','2026-06-03 09:45:00+00'),
  ('vis_qw_0064','biz_queenwest','cus_qw_0023','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-04 14:15:00+00','2026-06-04 14:15:00+00'),
  ('vis_qw_0065','biz_queenwest','cus_qw_0023','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-10 17:15:00+00','2026-06-10 17:15:00+00'),
  ('vis_qw_0066','biz_queenwest','cus_qw_0054','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-07 13:30:00+00','2026-06-07 13:30:00+00'),
  ('vis_qw_0067','biz_queenwest','cus_qw_0038','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-18 12:00:00+00','2026-06-18 12:00:00+00'),
  ('vis_qw_0068','biz_queenwest','cus_qw_0112','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-21 12:45:00+00','2026-06-21 12:45:00+00'),
  ('vis_qw_0069','biz_queenwest','cus_qw_0071','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-09 09:00:00+00','2026-06-09 09:00:00+00'),
  ('vis_qw_0070','biz_queenwest','cus_qw_0098','svc_qw_lineup','Line-up',15,1,'booking','2026-06-05 14:15:00+00','2026-06-05 14:15:00+00'),
  ('vis_qw_0071','biz_queenwest','cus_qw_0098','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-01 15:30:00+00','2026-06-01 15:30:00+00'),
  ('vis_qw_0072','biz_queenwest','cus_qw_0110','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-17 16:00:00+00','2026-06-17 16:00:00+00'),
  ('vis_qw_0073','biz_queenwest','cus_qw_0020','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-20 17:15:00+00','2026-06-20 17:15:00+00'),
  ('vis_qw_0074','biz_queenwest','cus_qw_0122','svc_qw_lineup','Line-up',15,1,'booking','2026-06-17 16:15:00+00','2026-06-17 16:15:00+00'),
  ('vis_qw_0075','biz_queenwest','cus_qw_0078','svc_qw_shave','Hot Towel Shave',35,1,'booking','2026-06-12 09:15:00+00','2026-06-12 09:15:00+00'),
  ('vis_qw_0076','biz_queenwest','cus_qw_0114','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-09 15:30:00+00','2026-06-09 15:30:00+00'),
  ('vis_qw_0077','biz_queenwest','cus_qw_0121','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-07 09:15:00+00','2026-06-07 09:15:00+00'),
  ('vis_qw_0078','biz_queenwest','cus_qw_0022','svc_qw_kids','Kids Cut',25,1,'booking','2026-06-14 11:30:00+00','2026-06-14 11:30:00+00'),
  ('vis_qw_0079','biz_queenwest','cus_qw_0103','svc_qw_cutbeard','Cut & Beard',50,1,'booking','2026-06-20 17:00:00+00','2026-06-20 17:00:00+00'),
  ('vis_qw_0080','biz_queenwest','cus_qw_0067','svc_qw_lineup','Line-up',15,1,'booking','2026-06-06 17:45:00+00','2026-06-06 17:45:00+00'),
  ('vis_qw_0081','biz_queenwest','cus_qw_0074','svc_qw_beard','Beard Trim',20,1,'booking','2026-06-21 18:30:00+00','2026-06-21 18:30:00+00'),
  ('vis_qw_0082','biz_queenwest','cus_qw_0074','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-10 16:00:00+00','2026-06-10 16:00:00+00'),
  ('vis_qw_0083','biz_queenwest','cus_qw_0099','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-08 13:00:00+00','2026-06-08 13:00:00+00'),
  ('vis_qw_0084','biz_queenwest','cus_qw_0032','svc_qw_grey','Grey Blending',45,1,'booking','2026-06-22 13:45:00+00','2026-06-22 13:45:00+00'),
  ('vis_qw_0085','biz_queenwest','cus_qw_0032','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-18 12:45:00+00','2026-06-18 12:45:00+00'),
  ('vis_qw_0086','biz_queenwest','cus_qw_0101','svc_qw_wash','Cut & Wash',40,1,'booking','2026-06-11 11:00:00+00','2026-06-11 11:00:00+00'),
  ('vis_qw_0087','biz_queenwest','cus_qw_0086','svc_qw_fade','Skin Fade',40,1,'booking','2026-06-20 14:30:00+00','2026-06-20 14:30:00+00'),
  ('vis_qw_0088','biz_queenwest','cus_qw_0036','svc_qw_buzz','Buzz Cut',25,1,'booking','2026-06-04 14:45:00+00','2026-06-04 14:45:00+00'),
  ('vis_qw_0089','biz_queenwest','cus_qw_0094','svc_qw_classic','Classic Cut',35,1,'booking','2026-06-13 14:00:00+00','2026-06-13 14:00:00+00');

update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-16 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0001';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0002';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0003';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0004';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0005';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0006';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-23 12:00:00+00', reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0007';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0008';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-19 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0009';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-03 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0010';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0011';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-22 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0012';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0013';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-16 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0014';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-09 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0015';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0016';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-13 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0017';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-01 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0018';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-17 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0019';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-20 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0020';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0021';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-14 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0022';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-10 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0023';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0024';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-19 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0025';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-03 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0026';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0027';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-17 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0028';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-11 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0029';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-09 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0030';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0031';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-22 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0032';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-01 12:00:00+00', reward_status='earning', status='active', referred_by='cus_qw_0058' where id='cus_qw_0033';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-14 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0034';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0035';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-04 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0036';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0037';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-18 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0038';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0039';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0040';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-04 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0041';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-10 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0042';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-20 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0043';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-08 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0044';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0045';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0046';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-17 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0047';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0048';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0049';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-17 12:00:00+00', reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0050';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-08 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0051';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-05 12:00:00+00', reward_status='earning', status='active', referred_by='cus_qw_0041' where id='cus_qw_0052';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-05 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0053';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-07 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0054';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-13 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0055';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0056';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0057';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-18 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0058';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0047' where id='cus_qw_0059';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0009' where id='cus_qw_0060';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-16 12:00:00+00', reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0061';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0062';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-22 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0063';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-20 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0064';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-12 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0065';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-04 12:00:00+00', reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0066';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-06 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0067';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-21 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0068';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-12 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0069';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0030' where id='cus_qw_0070';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-09 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0071';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-13 12:00:00+00', reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0072';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-16 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0073';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-21 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0074';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0075';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0076';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0077';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-12 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0078';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0054' where id='cus_qw_0079';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0080';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0081';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0082';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0083';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-03 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0084';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0085';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-20 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0086';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-16 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0087';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0054' where id='cus_qw_0088';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-16 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0089';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-19 12:00:00+00', reward_status='earning', status='inactive', referred_by='cus_qw_0064' where id='cus_qw_0090';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0091';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-17 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0092';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0093';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-13 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0094';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0095';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0096';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-10 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0097';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-05 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0098';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-08 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0099';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0100';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-11 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0101';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0102';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-20 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0103';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-10 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0104';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-08 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0105';
update customers set visit_count=2, points_balance=2, last_visit_date='2026-06-07 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0106';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0107';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-05-23 12:00:00+00', reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0108';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0058' where id='cus_qw_0109';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-17 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0110';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0111';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-21 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0112';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-07 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0113';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-09 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0114';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0115';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0116';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by='cus_qw_0020' where id='cus_qw_0117';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0118';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-09 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0119';
update customers set visit_count=0, points_balance=0, last_visit_date=null, reward_status='earning', status='inactive', referred_by=referred_by where id='cus_qw_0120';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-07 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0121';
update customers set visit_count=1, points_balance=1, last_visit_date='2026-06-17 12:00:00+00', reward_status='earning', status='active', referred_by=referred_by where id='cus_qw_0122';

insert into bookings (id, business_id, customer_id, customer_name, service_id, time_label, status, starts_at, duration_min, cancel_reason) values
  ('bk_qw_001','biz_queenwest','cus_qw_0071','Devon Tremblay','svc_qw_lineup','Completed','done','2026-05-06 15:00:00+00',15,null),
  ('bk_qw_002','biz_queenwest','cus_qw_0044','Kofi Osei','svc_qw_buzz','Completed','done','2026-05-16 15:30:00+00',25,null),
  ('bk_qw_003','biz_queenwest','cus_qw_0015','Chloe Tremblay','svc_qw_buzz','Completed','done','2026-05-06 09:15:00+00',25,null),
  ('bk_qw_004','biz_queenwest','cus_qw_0117','Ethan Chen','svc_qw_lineup','Completed','done','2026-05-18 15:30:00+00',15,null),
  ('bk_qw_005','biz_queenwest','cus_qw_0055','Theo Adams','svc_qw_lineup','Completed','done','2026-05-21 11:45:00+00',15,null),
  ('bk_qw_006','biz_queenwest','cus_qw_0073','Liam Adams','svc_qw_buzz','Completed','done','2026-05-22 16:30:00+00',25,null),
  ('bk_qw_007','biz_queenwest','cus_qw_0021','Chen Haddad','svc_qw_fade','May 14','cancelled','2026-05-22 14:45:00+00',40,'Cancelled by salon'),
  ('bk_qw_008','biz_queenwest','cus_qw_0039','Chloe Li','svc_qw_cutbeard','May 13','cancelled','2026-05-14 14:00:00+00',50,'Cancelled by salon'),
  ('bk_qw_009','biz_queenwest','cus_qw_0003','Raj Clark','svc_qw_shave','May 3','cancelled','2026-05-21 13:30:00+00',35,'Cancelled by salon'),
  ('bk_qw_010','biz_queenwest','cus_qw_0110','Kofi Reid','svc_qw_wash','May 16','cancelled','2026-05-24 10:00:00+00',40,'Cancelled by salon'),
  ('bk_qw_011','biz_queenwest','cus_qw_0094','Vikram Kaur','svc_qw_classic','May 19','cancelled','2026-05-25 10:00:00+00',35,'Cancelled by salon'),
  ('bk_qw_012','biz_queenwest','cus_qw_0023','Kofi Kaur','svc_qw_lineup','May 4','cancelled','2026-05-08 16:00:00+00',15,'Cancelled by salon'),
  ('bk_qw_013','biz_queenwest','cus_qw_0112','Liam Bouchard','svc_qw_beard','May 7','cancelled','2026-05-03 12:00:00+00',20,'Cancelled by salon'),
  ('bk_qw_014','biz_queenwest','cus_qw_0118','Maya Murphy','svc_qw_beard','May 25','cancelled','2026-05-10 09:45:00+00',20,'Cancelled by salon'),
  ('bk_qw_015','biz_queenwest','cus_qw_0121','Jack Scott','svc_qw_fade','May 23','cancelled','2026-05-28 16:15:00+00',40,'Cancelled by salon'),
  ('bk_qw_016','biz_queenwest','cus_qw_0062','Anton Tremblay','svc_qw_shave','May 13','cancelled','2026-05-03 09:15:00+00',35,'Cancelled by salon'),
  ('bk_qw_017','biz_queenwest','cus_qw_0045','Malik Scott','svc_qw_grey','May 8','cancelled','2026-05-22 14:00:00+00',45,'Cancelled by salon'),
  ('bk_qw_018','biz_queenwest','cus_qw_0106','Jamal Singh','svc_qw_grey','May 22','cancelled','2026-05-13 18:45:00+00',45,'Cancelled by salon'),
  ('bk_qw_019','biz_queenwest','cus_qw_0025','Diego Lavigne','svc_qw_wash','May 6','cancelled','2026-05-25 16:30:00+00',40,'Cancelled by salon'),
  ('bk_qw_020','biz_queenwest','cus_qw_0007','Felix Gagnon','svc_qw_lineup','May 27','cancelled','2026-05-26 13:30:00+00',15,'Cancelled by salon'),
  ('bk_qw_021','biz_queenwest','cus_qw_0120','Noah Li','svc_qw_classic','May 15','cancelled','2026-05-21 10:30:00+00',35,'Cancelled by salon'),
  ('bk_qw_022','biz_queenwest','cus_qw_0111','Sara Pelletier','svc_qw_classic','May 2','cancelled','2026-05-09 14:00:00+00',35,'Cancelled by salon'),
  ('bk_qw_023','biz_queenwest','cus_qw_0028','Malik Roy','svc_qw_shave','May 5','cancelled','2026-05-02 11:00:00+00',35,'Cancelled by salon'),
  ('bk_qw_024','biz_queenwest','cus_qw_0017','Daniel Khoury','svc_qw_wash','May 26','cancelled','2026-05-12 13:00:00+00',40,'no-show'),
  ('bk_qw_025','biz_queenwest','cus_qw_0105','Sara Osei','svc_qw_lineup','May 14','cancelled','2026-05-03 09:30:00+00',15,'no-show'),
  ('bk_qw_026','biz_queenwest','cus_qw_0018','Kofi Pham','svc_qw_kids','May 3','cancelled','2026-05-27 12:30:00+00',25,'no-show'),
  ('bk_qw_027','biz_queenwest','cus_qw_0030','Hassan Okafor','svc_qw_grey','May 21','cancelled','2026-05-11 11:30:00+00',45,'no-show'),
  ('bk_qw_028','biz_queenwest','cus_qw_0096','Mateo Tran','svc_qw_beard','May 24','cancelled','2026-05-08 12:15:00+00',20,'no-show'),
  ('bk_qw_029','biz_queenwest','cus_qw_0022','Oscar Nguyen','svc_qw_classic','May 12','cancelled','2026-05-09 14:30:00+00',35,'no-show'),
  ('bk_qw_030','biz_queenwest','cus_qw_0011','Hannah Tremblay','svc_qw_cutbeard','May 24','cancelled','2026-05-02 11:15:00+00',50,'no-show'),
  ('bk_qw_031','biz_queenwest','cus_qw_0083','Hugo Nguyen','svc_qw_shave','Completed','done','2026-06-11 12:15:00+00',35,null),
  ('bk_qw_032','biz_queenwest','cus_qw_0009','Hassan Rossi','svc_qw_wash','Completed','done','2026-06-13 18:00:00+00',40,null),
  ('bk_qw_033','biz_queenwest','cus_qw_0042','Elias Ferrari','svc_qw_classic','Completed','done','2026-06-15 16:15:00+00',35,null),
  ('bk_qw_034','biz_queenwest','cus_qw_0052','Chloe Cote','svc_qw_lineup','Completed','done','2026-06-02 18:00:00+00',15,null),
  ('bk_qw_035','biz_queenwest','cus_qw_0032','Theo Scott','svc_qw_cutbeard','Completed','done','2026-06-20 11:00:00+00',50,null),
  ('bk_qw_036','biz_queenwest','cus_qw_0090','Noah Adams','svc_qw_fade','Completed','done','2026-06-14 13:45:00+00',40,null),
  ('bk_qw_037','biz_queenwest','cus_qw_0001','Priya Tremblay','svc_qw_classic','Completed','done','2026-06-20 18:30:00+00',35,null),
  ('bk_qw_038','biz_queenwest','cus_qw_0006','Chen Reid','svc_qw_buzz','Completed','done','2026-06-07 14:45:00+00',25,null),
  ('bk_qw_039','biz_queenwest','cus_qw_0099','Aisha Patel','svc_qw_kids','Completed','done','2026-06-04 09:30:00+00',25,null),
  ('bk_qw_040','biz_queenwest','cus_qw_0005','Oscar Cote','svc_qw_buzz','Completed','done','2026-06-04 16:30:00+00',25,null),
  ('bk_qw_041','biz_queenwest','cus_qw_0003','Raj Clark','svc_qw_lineup','Completed','done','2026-06-07 18:15:00+00',15,null),
  ('bk_qw_042','biz_queenwest','cus_qw_0101','Caleb Bouchard','svc_qw_buzz','Completed','done','2026-06-02 16:15:00+00',25,null),
  ('bk_qw_043','biz_queenwest','cus_qw_0071','Devon Tremblay','svc_qw_beard','Completed','done','2026-06-04 16:00:00+00',20,null),
  ('bk_qw_044','biz_queenwest','cus_qw_0044','Kofi Osei','svc_qw_grey','Completed','done','2026-06-01 18:00:00+00',45,null),
  ('bk_qw_045','biz_queenwest','cus_qw_0098','Daniel Morin','svc_qw_beard','Completed','done','2026-06-15 17:45:00+00',20,null),
  ('bk_qw_046','biz_queenwest','cus_qw_0045','Malik Scott','svc_qw_lineup','Completed','done','2026-06-12 13:45:00+00',15,null),
  ('bk_qw_047','biz_queenwest','cus_qw_0067','Leah Reid','svc_qw_lineup','Completed','done','2026-06-11 14:00:00+00',15,null),
  ('bk_qw_048','biz_queenwest','cus_qw_0111','Sara Pelletier','svc_qw_grey','Completed','done','2026-06-13 15:15:00+00',45,null),
  ('bk_qw_049','biz_queenwest','cus_qw_0012','Maya Khoury','svc_qw_grey','Completed','done','2026-06-17 10:30:00+00',45,null),
  ('bk_qw_050','biz_queenwest','cus_qw_0018','Kofi Pham','svc_qw_beard','Completed','done','2026-06-10 13:00:00+00',20,null),
  ('bk_qw_051','biz_queenwest','cus_qw_0057','Noah Scott','svc_qw_cutbeard','Completed','done','2026-06-06 17:45:00+00',50,null),
  ('bk_qw_052','biz_queenwest','cus_qw_0043','Aisha Cote','svc_qw_beard','Completed','done','2026-06-03 15:30:00+00',20,null),
  ('bk_qw_053','biz_queenwest','cus_qw_0122','Logan Park','svc_qw_wash','Completed','done','2026-06-09 11:30:00+00',40,null),
  ('bk_qw_054','biz_queenwest','cus_qw_0066','Kofi Mensah','svc_qw_beard','Completed','done','2026-06-03 17:30:00+00',20,null),
  ('bk_qw_055','biz_queenwest','cus_qw_0019','Jack Sharma','svc_qw_lineup','Completed','done','2026-06-04 13:00:00+00',15,null),
  ('bk_qw_056','biz_queenwest','cus_qw_0116','Maya Khoury','svc_qw_cutbeard','Completed','done','2026-06-11 16:15:00+00',50,null),
  ('bk_qw_057','biz_queenwest','cus_qw_0022','Oscar Nguyen','svc_qw_grey','Completed','done','2026-06-01 18:00:00+00',45,null),
  ('bk_qw_058','biz_queenwest','cus_qw_0074','Tyler Singh','svc_qw_fade','Completed','done','2026-06-14 13:30:00+00',40,null),
  ('bk_qw_059','biz_queenwest','cus_qw_0097','Raj Sharma','svc_qw_cutbeard','Completed','done','2026-06-20 13:15:00+00',50,null),
  ('bk_qw_060','biz_queenwest','cus_qw_0008','Hugo Tran','svc_qw_classic','Completed','done','2026-06-22 15:00:00+00',35,null),
  ('bk_qw_061','biz_queenwest','cus_qw_0109','Noah Ferrari','svc_qw_cutbeard','9:00 AM','scheduled','2026-06-23 09:00:00+00',50,null),
  ('bk_qw_062','biz_queenwest','cus_qw_0068','Leah Lavigne','svc_qw_beard','11:30 AM','scheduled','2026-06-23 11:00:00+00',20,null),
  ('bk_qw_063','biz_queenwest','cus_qw_0028','Malik Roy','svc_qw_shave','2:00 PM','scheduled','2026-06-23 14:00:00+00',35,null),
  ('bk_qw_064','biz_queenwest','cus_qw_0048','Owen Kim','svc_qw_wash','5:00 PM','scheduled','2026-06-23 17:00:00+00',40,null),
  ('bk_qw_065','biz_queenwest','cus_qw_0035','Diego Singh','svc_qw_kids','10:00 AM','scheduled','2026-06-24 10:00:00+00',25,null),
  ('bk_qw_066','biz_queenwest','cus_qw_0038','Liam Murphy','svc_qw_cutbeard','1:00 PM','scheduled','2026-06-24 13:00:00+00',50,null),
  ('bk_qw_067','biz_queenwest','cus_qw_0039','Chloe Li','svc_qw_grey','4:30 PM','scheduled','2026-06-24 16:00:00+00',45,null),
  ('bk_qw_068','biz_queenwest','cus_qw_0014','Pavel Sharma','svc_qw_kids','9:00 AM','scheduled','2026-06-25 09:00:00+00',25,null),
  ('bk_qw_069','biz_queenwest','cus_qw_0082','Elias Walsh','svc_qw_beard','12:00 PM','scheduled','2026-06-25 12:00:00+00',20,null),
  ('bk_qw_070','biz_queenwest','cus_qw_0007','Felix Gagnon','svc_qw_classic','3:00 PM','scheduled','2026-06-26 15:00:00+00',35,null),
  ('bk_qw_071','biz_queenwest','cus_qw_0117','Ethan Chen','svc_qw_lineup','6:00 PM','scheduled','2026-06-26 18:00:00+00',15,null),
  ('bk_qw_072','biz_queenwest','cus_qw_0020','Aiden Nguyen','svc_qw_lineup','10:00 AM','scheduled','2026-06-27 10:00:00+00',15,null),
  ('bk_qw_073','biz_queenwest','cus_qw_0002','Raj Brown','svc_qw_cutbeard','2:00 PM','scheduled','2026-06-27 14:00:00+00',50,null),
  ('bk_qw_074','biz_queenwest','cus_qw_0036','Vikram Clark','svc_qw_beard','6:00 PM','scheduled','2026-06-23 18:00:00+00',20,null),
  ('bk_qw_075','biz_queenwest','cus_qw_0010','Nina Pham','svc_qw_classic','June 11','cancelled','2026-06-06 15:30:00+00',35,'no-show'),
  ('bk_qw_076','biz_queenwest','cus_qw_0047','Marcus Wang','svc_qw_classic','June 17','cancelled','2026-06-08 18:15:00+00',35,'no-show'),
  ('bk_qw_077','biz_queenwest','cus_qw_0107','Zoe Osei','svc_qw_grey','June 10','cancelled','2026-06-15 14:30:00+00',45,'no-show'),
  ('bk_qw_078','biz_queenwest','cus_qw_0085','Maya Kim','svc_qw_grey','June 18','cancelled','2026-06-07 11:00:00+00',45,'no-show');

insert into messages (id, business_id, customer_id, message_type, body, status, sent_at) values
  ('msg_qw_0001','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-05-23 13:00:00+00'),
  ('msg_qw_0002','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-05-06 16:00:00+00'),
  ('msg_qw_0003','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-05-26 14:00:00+00'),
  ('msg_qw_0004','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-05-03 13:00:00+00'),
  ('msg_qw_0005','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-05-06 16:00:00+00'),
  ('msg_qw_0006','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-05-05 10:00:00+00'),
  ('msg_qw_0007','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-05-07 12:00:00+00'),
  ('msg_qw_0008','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-05-26 19:00:00+00'),
  ('msg_qw_0009','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-05-01 13:00:00+00'),
  ('msg_qw_0010','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-05-10 15:00:00+00'),
  ('msg_qw_0011','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-05-11 19:00:00+00'),
  ('msg_qw_0012','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-05-09 14:00:00+00'),
  ('msg_qw_0013','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-05-17 16:00:00+00'),
  ('msg_qw_0014','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-05-12 12:00:00+00'),
  ('msg_qw_0015','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-18 18:00:00+00'),
  ('msg_qw_0016','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-14 13:00:00+00'),
  ('msg_qw_0017','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-12 13:00:00+00'),
  ('msg_qw_0018','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-16 13:00:00+00'),
  ('msg_qw_0019','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-12 09:00:00+00'),
  ('msg_qw_0020','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-06 16:00:00+00'),
  ('msg_qw_0021','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-08 15:00:00+00'),
  ('msg_qw_0022','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-04 13:00:00+00'),
  ('msg_qw_0023','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-07 16:00:00+00'),
  ('msg_qw_0024','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-21 16:00:00+00'),
  ('msg_qw_0025','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-21 17:00:00+00'),
  ('msg_qw_0026','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-10 13:00:00+00'),
  ('msg_qw_0027','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-04 14:00:00+00'),
  ('msg_qw_0028','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-19 09:00:00+00'),
  ('msg_qw_0029','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-19 09:00:00+00'),
  ('msg_qw_0030','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-12 14:00:00+00'),
  ('msg_qw_0031','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-06 16:00:00+00'),
  ('msg_qw_0032','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-11 12:00:00+00'),
  ('msg_qw_0033','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-06 16:00:00+00'),
  ('msg_qw_0034','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-22 17:00:00+00'),
  ('msg_qw_0035','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-11 10:00:00+00'),
  ('msg_qw_0036','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-16 15:00:00+00'),
  ('msg_qw_0037','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-19 19:00:00+00'),
  ('msg_qw_0038','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-16 19:00:00+00'),
  ('msg_qw_0039','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-19 13:00:00+00'),
  ('msg_qw_0040','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-20 10:00:00+00'),
  ('msg_qw_0041','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-06 11:00:00+00'),
  ('msg_qw_0042','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-11 09:00:00+00'),
  ('msg_qw_0043','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-06 10:00:00+00'),
  ('msg_qw_0044','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-08 19:00:00+00'),
  ('msg_qw_0045','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-16 15:00:00+00'),
  ('msg_qw_0046','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-05 16:00:00+00'),
  ('msg_qw_0047','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-18 16:00:00+00'),
  ('msg_qw_0048','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-18 15:00:00+00'),
  ('msg_qw_0049','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-13 11:00:00+00'),
  ('msg_qw_0050','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-02 18:00:00+00'),
  ('msg_qw_0051','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-09 19:00:00+00'),
  ('msg_qw_0052','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-06 10:00:00+00'),
  ('msg_qw_0053','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-07 14:00:00+00'),
  ('msg_qw_0054','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-01 10:00:00+00'),
  ('msg_qw_0055','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-05 19:00:00+00'),
  ('msg_qw_0056','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-05 16:00:00+00'),
  ('msg_qw_0057','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-16 13:00:00+00'),
  ('msg_qw_0058','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-08 19:00:00+00'),
  ('msg_qw_0059','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-01 17:00:00+00'),
  ('msg_qw_0060','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-09 17:00:00+00'),
  ('msg_qw_0061','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-03 10:00:00+00'),
  ('msg_qw_0062','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-14 14:00:00+00'),
  ('msg_qw_0063','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-13 10:00:00+00'),
  ('msg_qw_0064','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-06 16:00:00+00'),
  ('msg_qw_0065','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-18 17:00:00+00'),
  ('msg_qw_0066','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-14 18:00:00+00'),
  ('msg_qw_0067','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-03 18:00:00+00'),
  ('msg_qw_0068','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-16 13:00:00+00'),
  ('msg_qw_0069','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-01 15:00:00+00'),
  ('msg_qw_0070','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-09 09:00:00+00'),
  ('msg_qw_0071','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-18 12:00:00+00'),
  ('msg_qw_0072','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-17 14:00:00+00'),
  ('msg_qw_0073','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-05 17:00:00+00'),
  ('msg_qw_0074','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-09 09:00:00+00'),
  ('msg_qw_0075','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-11 17:00:00+00'),
  ('msg_qw_0076','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-02 17:00:00+00'),
  ('msg_qw_0077','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-12 17:00:00+00'),
  ('msg_qw_0078','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-13 17:00:00+00'),
  ('msg_qw_0079','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-18 16:00:00+00'),
  ('msg_qw_0080','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-08 10:00:00+00'),
  ('msg_qw_0081','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-08 14:00:00+00'),
  ('msg_qw_0082','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-20 14:00:00+00'),
  ('msg_qw_0083','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-10 10:00:00+00'),
  ('msg_qw_0084','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-13 09:00:00+00'),
  ('msg_qw_0085','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-11 09:00:00+00'),
  ('msg_qw_0086','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-03 14:00:00+00'),
  ('msg_qw_0087','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-01 12:00:00+00'),
  ('msg_qw_0088','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-03 14:00:00+00'),
  ('msg_qw_0089','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-15 09:00:00+00'),
  ('msg_qw_0090','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-04 13:00:00+00'),
  ('msg_qw_0091','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-04 11:00:00+00'),
  ('msg_qw_0092','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-07 13:00:00+00'),
  ('msg_qw_0093','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-18 12:00:00+00'),
  ('msg_qw_0094','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-13 13:00:00+00'),
  ('msg_qw_0095','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-13 15:00:00+00'),
  ('msg_qw_0096','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-14 13:00:00+00'),
  ('msg_qw_0097','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-14 12:00:00+00'),
  ('msg_qw_0098','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-17 18:00:00+00'),
  ('msg_qw_0099','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-13 16:00:00+00'),
  ('msg_qw_0100','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-13 12:00:00+00'),
  ('msg_qw_0101','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-11 15:00:00+00'),
  ('msg_qw_0102','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-05 17:00:00+00'),
  ('msg_qw_0103','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-21 11:00:00+00'),
  ('msg_qw_0104','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-20 12:00:00+00'),
  ('msg_qw_0105','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-02 15:00:00+00'),
  ('msg_qw_0106','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-21 13:00:00+00'),
  ('msg_qw_0107','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-11 17:00:00+00'),
  ('msg_qw_0108','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-10 17:00:00+00'),
  ('msg_qw_0109','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-11 13:00:00+00'),
  ('msg_qw_0110','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-14 16:00:00+00'),
  ('msg_qw_0111','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-07 15:00:00+00'),
  ('msg_qw_0112','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-08 17:00:00+00'),
  ('msg_qw_0113','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-21 15:00:00+00'),
  ('msg_qw_0114','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-17 14:00:00+00'),
  ('msg_qw_0115','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-06 18:00:00+00'),
  ('msg_qw_0116','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-15 19:00:00+00'),
  ('msg_qw_0117','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-13 19:00:00+00'),
  ('msg_qw_0118','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-07 09:00:00+00'),
  ('msg_qw_0119','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-05 10:00:00+00'),
  ('msg_qw_0120','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-20 17:00:00+00'),
  ('msg_qw_0121','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-13 13:00:00+00'),
  ('msg_qw_0122','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-01 10:00:00+00'),
  ('msg_qw_0123','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-06 13:00:00+00'),
  ('msg_qw_0124','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-18 16:00:00+00'),
  ('msg_qw_0125','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-22 10:00:00+00'),
  ('msg_qw_0126','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-10 15:00:00+00'),
  ('msg_qw_0127','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-08 14:00:00+00'),
  ('msg_qw_0128','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-11 12:00:00+00'),
  ('msg_qw_0129','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-12 19:00:00+00'),
  ('msg_qw_0130','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-04 15:00:00+00'),
  ('msg_qw_0131','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-02 11:00:00+00'),
  ('msg_qw_0132','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-13 13:00:00+00'),
  ('msg_qw_0133','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-07 13:00:00+00'),
  ('msg_qw_0134','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-12 14:00:00+00'),
  ('msg_qw_0135','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-06 10:00:00+00'),
  ('msg_qw_0136','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-11 13:00:00+00'),
  ('msg_qw_0137','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-18 15:00:00+00'),
  ('msg_qw_0138','biz_queenwest',null,'campaign','Automated campaign message','sent','2026-06-10 16:00:00+00'),
  ('msg_qw_0139','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-05 13:00:00+00'),
  ('msg_qw_0140','biz_queenwest',null,'reward_ready','Automated reward ready message','sent','2026-06-12 10:00:00+00'),
  ('msg_qw_0141','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-17 10:00:00+00'),
  ('msg_qw_0142','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-13 19:00:00+00'),
  ('msg_qw_0143','biz_queenwest',null,'welcome','Automated welcome message','sent','2026-06-17 17:00:00+00'),
  ('msg_qw_0144','biz_queenwest',null,'reminder','Automated reminder message','sent','2026-06-08 14:00:00+00');

insert into referrals (id, business_id, referrer_customer_id, referred_customer_id, referral_code, status) values
  ('ref_qw_001','biz_queenwest','cus_qw_0058','cus_qw_0109','KOFI3','completed'),
  ('ref_qw_002','biz_queenwest','cus_qw_0030','cus_qw_0070','HASSA1','completed'),
  ('ref_qw_003','biz_queenwest','cus_qw_0054','cus_qw_0079','AISHA1','completed'),
  ('ref_qw_004','biz_queenwest','cus_qw_0041','cus_qw_0052','OMAR','completed'),
  ('ref_qw_005','biz_queenwest','cus_qw_0054','cus_qw_0088','AISHA1','completed'),
  ('ref_qw_006','biz_queenwest','cus_qw_0020','cus_qw_0117','AIDEN','completed'),
  ('ref_qw_007','biz_queenwest','cus_qw_0058','cus_qw_0033','KOFI3','completed'),
  ('ref_qw_008','biz_queenwest','cus_qw_0047','cus_qw_0059','MARCU','completed'),
  ('ref_qw_009','biz_queenwest','cus_qw_0064','cus_qw_0090','OMAR1','completed'),
  ('ref_qw_010','biz_queenwest','cus_qw_0009','cus_qw_0060','HASSA','completed');

