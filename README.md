# TanKanban

A modern Kanban board application built with TanStack Start, featuring drag-and-drop functionality, OAuth authentication, and a SQLite database powered by Bun.

## Overview

TanKanban is a full-stack task management application that demonstrates the use of TanStack Start for building React applications with server-side rendering. It includes Kanban boards with columns and cards, user authentication via Keycloak and Google OAuth, and a type-safe database layer with Drizzle ORM.

## Tech Stack

| Category | Technology |
|----------|-------------|
| **Framework** | TanStack Start (React full-stack) |
| **Runtime** | Bun |
| **Build Tool** | Vite 7.x |
| **Server Engine** | Nitro (Bun preset) |
| **Database** | SQLite (bun:sqlite) |
| **ORM** | Drizzle ORM |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Authentication** | Keycloak + Google OAuth (Arctic) |
| **Drag & Drop** | @dnd-kit |
| **UI Components** | Radix UI |
| **Language** | TypeScript |

## Quickstart

### Prerequisites

- [Bun](https://bun.sh) installed
- [Docker](https://docker.com) (for Keycloak authentication service)

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Start Keycloak (OAuth provider)
docker-compose up -d keycloak

# Start development server (http://localhost:3000)
bun run dev
```

### Database Setup

```bash
# Generate migration files from schema changes
bun run db:generate

# Apply migrations to development database
bun run db:migrate

# Or push schema changes directly (no migration history)
bun run db:push

# Open Drizzle Studio (GUI for database)
bun run db:studio
```

## Production Guide

### Building for Production

```bash
bun run build
```

This creates the `.output/` directory containing:
- `server/` - Compiled server code
- `public/` - Static assets
- `drizzle/` - SQL migration files
- `migrate.mjs` - Standalone migration script (self-contained)

### Deployment Steps

1. **Copy only `.output/` to your production server** (no need for full codebase, node_modules, or source files)

2. **Set environment variables** in production:
   ```bash
   export DATABASE_URL="/path/to/production.db"
   export NODE_ENV="production"
   export APP_BASE_URL="https://yourdomain.com"
   export KEYCLOAK_BASE_URL="https://keycloak.yourdomain.com/realms/tankanban"
   export KEYCLOAK_CLIENT_ID="your-client-id"
   export KEYCLOAK_CLIENT_SECRET="your-client-secret"
   # Optional: Google OAuth
   export GOOGLE_CLIENT_ID="your-google-client-id"
   export GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

3. **Run database migrations** (uses only files in `.output/`):
   ```bash
   bun run .output/migrate.mjs
   ```
   Expected output: `✅ Migrations completed successfully`

4. **Start the production server**:
   ```bash
   bun run .output/server/index.mjs
   ```

### Production Files Structure

```
.output/
├── server/
│   ├── index.mjs          # Main server entry point
│   ├── _chunks/           # SSR renderer
│   ├── _libs/             # Bundled dependencies
│   └── _ssr/              # Server-side rendering code
├── public/
│   ├── assets/            # JS, CSS, fonts
│   ├── favicon.ico
│   └── ...
├── drizzle/
│   ├── 0000_*.sql         # Migration files
│   ├── 0001_*.sql
│   └── meta/              # Migration metadata
└── migrate.mjs             # Standalone migration runner
```

### Notes

- The migration script (`migrate.mjs`) is fully self-contained - it bundles all necessary dependencies and doesn't require `node_modules` or source code in production
- Migrations are run separately from the server start, giving you control over when schema changes are applied
- SQLite database file is created automatically at the path specified in `DATABASE_URL`

## License

[Add your license here]
