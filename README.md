# Nomichi Trip Desk

A working web app for Nomichi to capture traveller enquiries and manage them from first contact to a confirmed seat.

## What This Solves

Nomichi currently handles leads, trip details, call notes, and status updates across separate manual tools. Trip Desk brings the core workflow into one place:

- Travellers can browse open trips and submit an enquiry.
- The Nomichi team can review new leads, assign ownership, log calls, and move leads through the sales pipeline.
- Trips can be created and edited from the admin workspace, and open trips automatically appear on the public page.

## Features

### Public Lead Capture

- Mobile-first landing page with Nomichi brand colours and travel-focused visuals.
- Live open trips with destination, dates, price including GST, description, and seats left.
- Public `/trips` page with search, destination filter, and sorting.
- Enquiry form with validation for name, phone, email, trip, group type, and preferred month.
- "I'm Interested" buttons pre-select the trip and guide the traveller to the enquiry form.
- Successful form submissions are saved to Supabase and create a dashboard notification.

### Admin Mini-CRM

- Supabase Auth protected admin area.
- Dashboard overview with total leads, leads by stage, recent leads, and leads per trip.
- Lead list with search, status filter, trip filter, owner filter, pagination, export, and lead detail links.
- Lead detail workspace with traveller information, selected trip information, pipeline status, owner assignment, and call notes.
- Pipeline stages: New, Contacted, Qualified, Vibe Check, Sent, Confirmed, Not a Fit.
- Notifications for fresh enquiries, with dismiss state stored in the database.

### Trips CMS

- Create and edit trips from the admin workspace.
- Upload or keep trip images.
- Open trips appear publicly. Closed trips remain in the system but do not appear on the public enquiry page.
- Trip table includes search, filters, export, status, dates, seats, and image-aware rows.

### AI-Assisted Feature

- Server-side AI WhatsApp draft generator on the lead detail page.
- Uses lead answers and trip details to draft a warm first message.
- Supports OpenAI or Gemini via environment variables.
- Falls back to a safe local draft if no AI provider key is configured.
- Secrets are never exposed to the browser.

## Tech Stack

- Next.js App Router
- TypeScript
- Supabase Postgres, Auth, Storage, and Realtime
- Tailwind CSS
- Radix UI primitives
- Vercel

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Required:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional AI provider. Configure one:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

## Supabase Setup

Run these SQL files in Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. `supabase/new-lead-notifications.sql`

The schema creates the main tables, storage bucket, policies, seed trips, seed leads, and notification trigger used by the dashboard.

## Key Routes

- `/` public enquiry page
- `/trips` public trip browser
- `/login` admin login
- `/admin/dashboard` team overview
- `/admin/leads` lead list
- `/admin/leads/[id]` lead detail workspace
- `/admin/trips` trip management
- `/admin/trips/new` create trip
- `/admin/trips/[id]/edit` edit trip

## Implementation Notes

- The public enquiry flow is the only way leads are created, so the lead source stays clean.
- Open trips are read live from Supabase and closed trips stay hidden from public enquiry pages.
- Notification dismissals are stored in the backend, so the admin workspace is consistent across devices.
- AI message drafting runs server-side only and never exposes provider keys to the browser.
- The app falls back to demo trip data if Supabase environment variables are not configured locally.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```
