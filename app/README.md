# Recycler App

## Tech stack used

- Node.js
- TypeScript
- React
- Next.js
- Tailwind CSS
- Mapbox
- Docker
- PostgreSQL

## Getting Started

### Prerequisites

- Node.js
- npm
- Docker

We recommend using [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) to manage Node.js versions.

### Set upt env variables

Create .env from .env.example and insert the variables there (e.g. NEXT_PUBLIC_MAPBOX_TOKEN=)

```bash
cp .env.example .env
```

Install dependencies

```bash
npm install
```

Launch local services

```bash
docker compose up
```

Run migrations

```bash
npm run migrate
```

### Category And Map Icons

Category icons can be selected for each multiple-choice option in the object-type field editor. Existing recycling categories retain their default icons unless an override is selected. The Map tab of the use-case settings accepts a PNG marker image up to 1 MB; uploaded images are fitted to a fixed marker size, and the default recycling marker can be restored.

Run the focused icon-settings regression checks with `npx tsx --test scripts/icon-settings.test.ts`.

### Use-case usage analytics

The use-case administration Usage statistics page collects map views, configured map-filter selections, and coarse AI chat topic counts after the usage-events migration has been applied. Run `npm run migrate` whenever deploying schema changes. Analytics does not store chat text, images, or free-form search terms; see [the usage analytics architecture](../docs/architecture/usage_analytics.md) for the event model, privacy boundaries, access checks, and current retention limitations. New deployments start with empty usage statistics; existing analytics are not backfilled.

Run seeds

```bash
npm run seed
```

Run the development server:

```bash
npm run dev
```

Fetch materials

```bash
curl -X POST http://localhost:3000/api/etl/materials
```

Fetch collection spots

```bash
curl -X POST http://localhost:3000/api/etl/collection_spots
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To add new migration file

```bash
npm run knex -- migrate:make
```

To add new seed file

```bash
npm run knex -- seed:make
```
