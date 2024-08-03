# Recycler frontend

## Tech stack used

- TypeScript
- React
- Next.js
- Tailwind CSS
- Mapbox
- Docker

## Getting Started

### Set upt env variables

Create .env from .env.example and insert the variables there (e.g. NEXT_PUBLIC_MAPBOX_TOKEN=)

```bash
cp .env.example .env
```

Install dependencies

```bash
npm install
```

Launch local database

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
