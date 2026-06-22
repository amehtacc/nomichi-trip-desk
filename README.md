# Nomichi Trip Desk

A focused lead and trip management platform for Nomichi.

## Features

- Public mobile-first trip listing with enquiry form.
- Supabase Auth protected admin area.
- Trip create/edit/open/close workflow.
- Lead table with search and filters.
- Lead detail page with traveller info, trip info, status, owner, notes, and activity dates.
- Dashboard cards for total leads, leads by stage, and leads per trip.
- First WhatsApp draft generation through OpenAI or Gemini, server-side only.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Run `supabase/schema.sql` in Supabase SQL Editor, then optionally run
`supabase/seed.sql`.

Required env vars:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional AI env vars:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

If Supabase env vars are missing, the public site shows local demo trips and
admin login displays a setup message.

## Routes

- `/`
- `/login`
- `/admin/dashboard`
- `/admin/leads`
- `/admin/leads/[id]`
- `/admin/trips`
- `/admin/trips/new`
- `/admin/trips/[id]/edit`
