# VIP Club

A retention, loyalty & reactivation web app for salons, barbershops and beauty studios.
Customers join by QR, get a personal VIP pass, earn rewards every visit, and receive
automated SMS reminders and offers. Built with **Next.js (App Router) + TypeScript** and
deployed on **Vercel**.

## Why this stack

- **One language, one deploy.** Frontend and backend live together; the API is a set of
  Vercel serverless functions (`app/api/**/route.ts`) — low-latency, auto-scaling, zero ops.
- **Simple, swappable backend.** Runs out of the box on a seeded in-memory store. Add
  Supabase to switch on real persistence; add Twilio to switch on real SMS. No code changes.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

It works immediately with demo data and mock SMS (texts print to the server console).

### Pages

| Route | What it is |
|-------|-----------|
| `/` | Landing / role chooser |
| `/login` | Staff / owner / admin sign-in (demo accounts shown on the page) |
| `/join/biz_bella` | Customer QR-signup page (name, phone, email, birthday, referral code) |
| `/pass/<customerId>` | A member's personal VIP pass (unique QR + reward progress + referral code) |
| `/checkin/<customerId>` | **Staff-only** check-in (opened by scanning the pass QR) → Add Visit |
| `/owner` | **Owner/staff** app: dashboard, scan, bookings + scheduling, members, messaging |
| `/owner/client/<id>` | **Owner/staff** client profile: history, notes, status, manual visit, redeem |
| `/admin` | **Admin-only** analytics console across all shops |

Sign in with the demo accounts (password `vip12345`): `owner@bella.test`,
`staff@bella.test`, `admin@vipclub.test`.

### Auth & roles

Sessions are signed httpOnly cookies (HMAC-SHA256); passwords are PBKDF2-hashed.
`middleware.ts` gates `/owner`, `/admin`, `/checkin`; write APIs re-check the role
server-side. Set a strong `AUTH_SECRET` in production.

### API

Public: `POST /api/signup` · `GET /api/customers/[id]` · `GET /api/bookings/[id]/ics`
· `POST /api/sms/inbound` (Twilio STOP webhook) · `POST /api/auth/login` · `POST /api/auth/logout`.
Auth-gated: `POST /api/customers/[id]/visit` · `POST /api/customers/[id]/redeem` ·
`POST /api/bookings` (schedule + email invite) · `POST /api/bookings/[id]/complete` ·
`PATCH /api/clients/[id]` · `POST /api/campaigns` · `GET /api/admin/stats` (admin) ·
`GET/POST /api/reminders/run` (cron).

### Scheduling, calendar & email

`POST /api/bookings` creates an appointment and emails the client an invite with an
**`.ics` attachment** plus **Add-to-Google/Android** and **Add-to-Outlook** links — so
the customer gets the full appointment in their calendar. Email goes through **Resend**
when `RESEND_API_KEY` + `EMAIL_FROM` are set (add these once your sending domain is
live); until then it's mock-logged. The `.ics` is also downloadable at
`/api/bookings/<id>/ics`.

### Reminders

`/api/reminders/run` finds members past their rebooking window and texts them. It's
wired to a daily **Vercel Cron** in `vercel.json` and protected by `CRON_SECRET`.

## Switch on real services

Copy `.env.example` → `.env` and fill in keys.

**Supabase (persistence):** create a project, run [`supabase/schema.sql`](supabase/schema.sql)
**then** [`supabase/schema-auth.sql`](supabase/schema-auth.sql) in the SQL editor, then set
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The app detects the keys and uses Postgres
automatically (users, bookings, referrals, reminders included).

**Twilio (SMS):** set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.
Point the number's inbound webhook at `/api/sms/inbound` for STOP handling.
Without them, messages are logged to the console instead of sent.

**Email (Resend):** once your sending domain is verified, set `RESEND_API_KEY` and
`EMAIL_FROM`. Booking invites (with `.ics` + Add-to-Calendar links) then send for real.

**Auth:** set a strong random `AUTH_SECRET`. Create real staff/owner/admin accounts in the
`users` table (passwords are PBKDF2-hashed by the app — the seeded demo logins use plain
demo passwords only in the zero-config in-memory mode).

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo** (framework auto-detected as Next.js).
3. Add the environment variables from `.env.example` (set `NEXT_PUBLIC_BASE_URL` to your
   domain).
4. Deploy. Point your purchased domain at the project in **Settings → Domains**.

## Design references

The standalone HTML prototypes and the logo/brand sheet live at the repo root
(`VIP-Club-Prototype.html`, `VIP-Club-Admin-Console.html`, `VIP-Club-Brand.html`,
`VIP-Club-Logo.svg`) — design source of truth, not part of the build.
