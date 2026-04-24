# Insora

**Insora** is a friendly insurance guide for teens aged 11-18 and their parents: products, scenarios, mini-games, and a chat with the **Ingo** assistant. It is implemented as a mobile-first web application.

This is a full-stack system: client (React, Vite), server (Fastify, REST), persistent storage (SQLite, Prisma), and an OpenAI-based chat. Content is centrally loaded into the database and served through the API.

## Stack

| Layer | Technologies |
|------|------------|
| Client | React 19, React Router, Vite 8 |
| Server | Fastify 5, `@fastify/cookie`, `@fastify/cors` |
| Data | Prisma 6, SQLite |
| AI | OpenAI API (Ingo chat) |
| Containers | Docker Compose |

## Features

- Screens: home, products, scenarios, results, games, Ingo chat.
- Anonymous sessions via HttpOnly cookie `insora_sid`.
- Result calculation for the "Accident" scenario (answer matrix).
- Persistence of scenario runs, game runs, and chat history.
- Chat context is assembled from products, FAQ, scenarios, and recent user analyses.

## Requirements

- Node.js with npm
- OpenAI key (`OPENAI_API_KEY`) for Ingo chat

## Quick Start

```bash
npm install
cp .env.example .env   # if missing, create .env using the section below
npm run db:push
npm run db:seed
npm run dev
```

The `dev` command starts the client and API in parallel. Vite prints the frontend URL in the terminal (often `http://localhost:5173`). API: `http://127.0.0.1:3001`.

Run client and server in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

## Environment Variables

Minimal `.env` example:

```env
DATABASE_URL="file:./prisma/dev.db"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
API_PORT="3001"
API_HOST="127.0.0.1"
```

Without `OPENAI_API_KEY`, the app and scenarios still work; sending chat messages returns an error about a missing key configuration.

## Docker

```bash
docker compose up --build
```

- Web: `http://localhost:4173`
- API: `http://localhost:3001`
- SQLite data stored in volume `insora_data`

With an OpenAI key:

```bash
OPENAI_API_KEY=... docker compose up --build
```

Full data reset:

```bash
docker compose down -v && docker compose up --build
```

## API (Overview)

| Method | Path |
|-------|------|
| GET | `/api/health`, `/api/bootstrap` |
| GET | `/api/products`, `/api/products/:slug` |
| GET | `/api/products/:slug/scenarios`, `/api/products/:slug/scenarios/:scenarioSlug` |
| POST | `/api/ns/evaluate`, `/api/scenario-runs` |
| GET | `/api/scenario-runs/:id` |
| GET/POST | `/api/chat/history`, `/api/chat/messages` |
| GET | `/api/games`, `/api/games/:slug` |
| POST | `/api/game-runs` |

Implementation: `server/src/app.js`, services in `server/src/services/`.

## Data and Content

- Schema: `prisma/schema.prisma`, seed: `prisma/seed.js`.
- Seed content source: `server/content/prototypeSnapshot.jsx` (loaded via `server/content/loadSnapshot.js`).

Flow: snapshot -> seed -> database -> API -> client.

## Scripts

```bash
npm run lint          # ESLint
npm run build         # Vite production build
npm run db:generate   # Prisma Client
npm run db:push       # schema -> database
npm run db:seed       # data
npm run db:studio     # Prisma Studio
```
