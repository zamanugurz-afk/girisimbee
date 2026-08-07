# Girisimbee

Marketplace platform for startups, investors, job seekers, and employers — built with Next.js 13 (App Router), TypeScript, Tailwind CSS, and Supabase.

## Prerequisites

- Node.js 18+
- npm
- Git
- A [Supabase](https://supabase.com) project
- A [GitHub](https://github.com) account (for source control)
- A [Vercel](https://vercel.com) account (for deployment)

## Local development

```bash
npm install
cp .env.example .env
# Edit .env with your Supabase credentials and site URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env` and set:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Prod | Public site URL for auth redirects |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Service role key (never expose to client) |
| `NEXT_PUBLIC_OWNER_TOKEN` | Optional | Legacy İkinciBazar token routes |

On Vercel Preview, `VERCEL_URL` is used when `NEXT_PUBLIC_SITE_URL` is unset.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Set the environment variables from `.env.example` in the Vercel project settings.
4. Deploy — Vercel detects Next.js automatically; no extra config required.

## License

Private — all rights reserved.
