# Recycler frontend

## Tech stack used

- TypeScript
- React
- Next.js
- Tailwind CSS
- Mapbox
- Docker
- Postgres

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

Launch local services

```bash
docker compose up
```

Install LLM

1. Connect OLLAMA container via terminal

```bash
docker exec -it frontend-ollama-1 /bin/bash
```

2. Pull [Ahma-7B-Instruct-GGUF](https://huggingface.co/mradermacher/Ahma-7B-Instruct-GGUF) LLM from Hugging Face

```bash
ollama pull hf.co/mradermacher/Ahma-7B-Instruct-GGUF:Q4_K_M
ollama pull all-minilm
```

3. Close connection

```bash
exit
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
