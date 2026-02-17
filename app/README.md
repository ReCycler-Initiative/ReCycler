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
