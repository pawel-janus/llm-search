# LLM Search

Semantic search over SEC quarterly filings using Vertex AI embeddings and Firestore vector search.

**Part of:** [AI/LLM POC sequence](https://github.com/pawel-janus/ai-llm-pocs) - POC #1

## Features

- ✅ Vertex AI Text Embeddings API (768D vectors)
- ✅ BigQuery data loading (1000 SEC quarterly filings)
- ✅ Firestore vector search (cosine similarity)
- ✅ Semantic search API (Fastify)
- ✅ React UI (search + results list)
- ✅ Cloud Run deployment

## Tech Stack

- **Backend:** Fastify (TypeScript)
- **Frontend:** React + Vite (TypeScript)
- **Shared:** Zod schemas (type safety between FE/BE)
- **Embeddings:** Vertex AI text-embedding-004 (768D)
- **Vector DB:** Firestore vector search
- **Data:** BigQuery (SEC public dataset)
- **Deploy:** Cloud Run (GCP)

## Architecture

**Monorepo with npm workspaces:**

```
llm-search/
├── packages/
│   ├── shared/          # Zod schemas, shared types
│   ├── backend/         # Fastify API
│   └── frontend/        # React + Vite
└── package.json         # Workspace root
```

## API Design

### Why POST for search?

While `/api/search` retrieves data (typically GET), we use POST for:

1. **Vector search complexity** - Not a simple keyword lookup
2. **Future extensibility** - POC #2+ adds filters, model params, reranking
3. **Industry pattern** - Elasticsearch, Pinecone, Algolia use POST for vector search
4. **No breaking changes** - Consistent API across all POCs

Example evolution:
- POC #1: `{ query: "Apple revenue" }`
- POC #2: `{ query: "...", model: "gemini-2.0-flash", temperature: 0.7 }`
- POC #5: `{ query: "...", filters: {...}, rerank: true, limit: 10 }`

## Local Development

```bash
# Install dependencies (all workspaces)
npm install

# Build shared package
npm run build:shared

# Run backend (dev mode)
npm run dev:backend

# Run frontend (dev mode)
npm run dev:frontend
```

## Deploy to Cloud Run

```bash
# Build + deploy
PROJECT_ID=native-dev-506112
REGION=europe-central2
SERVICE_NAME=llm-search

gcloud builds submit \
  --account=paweljanus.gcp@gmail.com \
  --project=${PROJECT_ID} \
  --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/gcp-apps/${SERVICE_NAME}:latest

gcloud run deploy ${SERVICE_NAME} \
  --account=paweljanus.gcp@gmail.com \
  --project=${PROJECT_ID} \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/gcp-apps/${SERVICE_NAME}:latest \
  --platform=managed \
  --region=${REGION} \
  --allow-unauthenticated \
  --port=3001 \
  --memory=512Mi \
  --cpu=1
```

## Live Demo

[Coming soon - deployed after implementation]

## What's Next

- POC #2: RAG Basics (Gemini 2.0 Flash integration)
- POC #3: Agents & Tool Use (multi-source data fusion)
- POC #4: Multi-turn Conversations

## License

MIT
