# Harumi JLPT N2 Smart Trainer

Production-ready Japanese learning platform focused on helping users pass the JLPT N2 exam.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Zustand
- **Backend**: Next.js API Routes, PostgreSQL, Prisma ORM
- **Auth**: NextAuth (JWT)

## Features

- **Authentication**: Register, Login, JWT session
- **Vocabulary**: Flashcards, Quiz, Bookmark, Progress tracking
- **Kanji**: Browse, Detail pages, Quiz
- **Grammar**: Lessons, Quiz
- **Reading**: Passages with comprehension questions
- **Listening**: Audio passages with questions
- **Mock Test**: Full JLPT exam simulation with timer
- **Progress Dashboard**: Stats, accuracy, weak areas
- **SRS**: Spaced repetition for vocabulary

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL

### Setup

1. Clone and install:

```bash
npm install
```

2. Create `.env` (see `.env.example` for all variables):

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jlpt_n2_trainer"
NEXTAUTH_SECRET="your-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
# Optional: OpenAI for AI features; Google/Facebook OAuth for social login (see .env.example)
```

3. Initialize database:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. Run dev server:

```bash
npm run dev
```

5. Open http://localhost:3000

`npm install` runs `prisma generate` automatically (`postinstall`). Production builds run `prisma generate && next build` so Prisma Client stays in sync (required for hosts like Vercel that cache dependencies).

### Deploy (Vercel)

1. **Environment variables** — Add these in the Vercel project settings (Production + Preview if you use previews):
   - `DATABASE_URL` — connection string from your host (e.g. Neon, Supabase). Required for any route that uses Prisma at **runtime**.
   - `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — use your production site URL for `NEXTAUTH_URL` (e.g. `https://your-app.vercel.app`).
   - Optional: `OPENAI_API_KEY`, Google/Facebook OAuth vars from `.env.example` if you use those features.

   The dashboard App Router segment uses `dynamic = 'force-dynamic'`, so `next build` does not need a live database or `DATABASE_URL` only for the build step—but the deployed app will error on data routes until `DATABASE_URL` is set correctly.

2. Connect the Git repository; the default **Build Command** `npm run build` already runs `prisma generate` (see `postinstall` in `package.json`).

### Demo Account

- Email: `demo@jlpt.com`
- Password: `password123`

## Project Structure

```
/app              - Pages (App Router)
/components       - Reusable UI
/features         - Domain modules (vocab, kanji, grammar, etc.)
/lib              - Utils, db, auth
/server           - Business logic, services
/prisma           - Schema, migrations, seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | `prisma generate` then Next.js production build |
| `npm run db:generate` | Generate Prisma client (also runs on `postinstall` / before `build`) |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Run seed data |
| `npm run db:studio` | Open Prisma Studio |

## License

MIT
