# Aliko CV

A modern CV/resume management platform built with Next.js 16, Better Auth, and Drizzle ORM inside a Turborepo monorepo.

## Tech Stack

- **Runtime** — [Bun](https://bun.sh) 1.2+
- **Monorepo** — [Turborepo](https://turbo.build) with Bun workspaces
- **Framework** — [Next.js](https://nextjs.org) 16 (App Router, Turbopack)
- **Auth** — [Better Auth](https://www.better-auth.com) (email/password, password reset)
- **Database** — PostgreSQL via [Drizzle ORM](https://orm.drizzle.team)
- **UI** — [Tailwind CSS](https://tailwindcss.com) 4, [shadcn/ui](https://ui.shadcn.com), [Base UI](https://base-ui.com)
- **Validation** — [Zod](https://zod.dev) 4 + [React Hook Form](https://react-hook-form.com)
- **Linting** — ESLint 9 with `eslint-plugin-drizzle`, Prettier with `prettier-plugin-tailwindcss`

## Project Structure

```
apps/
  web/             → Next.js 16 application
packages/
  auth/            → Better Auth server configuration
  db/              → Drizzle ORM client, schema, migrations
  ui/              → Shared React components (shadcn/ui based)
  eslint-config/   → Shared ESLint configuration
  typescript-config/ → Shared tsconfig presets
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.2
- [Node.js](https://nodejs.org) >= 20
- PostgreSQL database (local or hosted)

### Setup

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your values:

   | Variable | Description |
   |---|---|
   | `POSTGRES_URL` | PostgreSQL connection string |
   | `BETTER_AUTH_SECRET` | Random string (>= 32 chars) for signing sessions |
   | `BETTER_AUTH_URL` | App base URL, e.g. `http://localhost:3000` |
   | `NEXT_PUBLIC_BETTER_AUTH_URL` | Same as above (exposed to the browser) |
   | `RESEND_API_KEY` | *(optional)* Resend key for password-reset emails |
   | `RESEND_FROM_EMAIL` | *(optional)* Sender address for password-reset emails |

3. **Push the database schema**

   ```bash
   bun run db:push
   ```

4. **Start the dev server**

   ```bash
   bun run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Scripts

Run these from the repository root:

| Command | Description |
|---|---|
| `bun run dev` | Start all apps in dev mode (Turbopack) |
| `bun run build` | Production build for all packages |
| `bun run lint` | Lint all packages |
| `bun run format` | Format code with Prettier |
| `bun run typecheck` | TypeScript type checking |
| `bun run db:push` | Push Drizzle schema to the database |
| `bun run auth:generate` | Regenerate Better Auth schema into `packages/db` |

## Auth Schema Generation

Better Auth manages its own tables (`user`, `session`, `verification`, `account`). When you change the auth configuration:

```bash
bun run auth:generate
bun run db:push
```

This regenerates `packages/db/src/auth-schema.ts` and pushes the updated schema to Postgres.

## License

Private — all rights reserved.
