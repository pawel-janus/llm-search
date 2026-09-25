# LLM Search

Semantic search over SEC quarterly filings using Vertex AI embeddings and Firestore vector search.

**Part of:** [AI/LLM POC sequence](https://github.com/pawel-janus/ai-llm-pocs) - POC #1

## Features

**✅ Implemented:**
- Backend API (Fastify with BigQuery data)
- Frontend UI (React + Vite)
- Cloud Run deployment (serverless, auto-scaling)
- BigQuery data loading (275 SEC quarterly filings from public dataset)
- Firestore vector search setup (with mock 768D embeddings)
- Vertex AI embeddings integration (single text embedding works)

**🚧 In Progress:**
- Replace mock embeddings with real Vertex AI embeddings
- Update query embedding (mock → Vertex AI)
- Semantic search quality testing

**Status:** ~80% complete. Firestore vector search works with mock embeddings. Next: Replace mock with real Vertex AI embeddings.

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
│   ├── backend/         # Fastify API + serves frontend static files
│   └── frontend/        # React + Vite
└── package.json         # Workspace root
```

**Production deployment:**
- Backend (Fastify) serves both API (`/api/*`) and frontend static files (`/`)
- Single Cloud Run service (one container, one URL)
- Frontend built with Vite → static files served by `@fastify/static`

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

## Prerequisites

### GCP APIs Required

Enable the following APIs in your GCP project:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  firestore.googleapis.com \
  bigquery.googleapis.com \
  --account=YOUR_ACCOUNT@gmail.com \
  --project=YOUR_PROJECT_ID
```

**Required APIs:**
- **Cloud Run** - Serverless container deployment
- **Cloud Build** - Docker image building
- **Artifact Registry** - Container image storage
- **Vertex AI** - Text embeddings API (text-embedding-004)
- **Firestore** - Vector search database
- **BigQuery** - SEC filings data source

### Local Authentication

For local development (connect to GCP services from localhost):

```bash
# Application Default Credentials
gcloud auth application-default login --account=YOUR_ACCOUNT@gmail.com

# Set project (or add to .env file)
export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
```

**Note:** Production (Cloud Run) uses Service Account authentication automatically.

## Local Development

```bash
# Install dependencies (all workspaces)
npm install

# Build shared package (required before running backend/frontend)
npm run build:shared

# Run backend (dev mode, port 3001)
npm run dev:backend

# Run frontend (dev mode, port 5173)
npm run dev:frontend
```

**Test backend:**

```bash
# Health check
curl http://localhost:3001/health

# Search test
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Apple revenue 2024"}'
```

**Current implementation:** Keyword matching over real BigQuery data (275 SEC filings, cached in-memory)

**Test UI:**

Open http://localhost:5173 in browser and try:
- "Apple revenue 2024"
- "Microsoft MSFT"
- "Tech company profits"

## Deploy to Cloud Run

```bash
# Configure deployment variables
PROJECT_ID=YOUR_PROJECT_ID
REGION=YOUR_REGION              # e.g., europe-central2
ACCOUNT=YOUR_ACCOUNT@gmail.com
REPOSITORY=YOUR_REPOSITORY      # Artifact Registry repo, e.g., gcp-apps
SERVICE_NAME=llm-search

# Build Docker image
gcloud builds submit \
  --account=${ACCOUNT} \
  --project=${PROJECT_ID} \
  --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:latest

# Deploy to Cloud Run
gcloud run deploy ${SERVICE_NAME} \
  --account=${ACCOUNT} \
  --project=${PROJECT_ID} \
  --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}:latest \
  --platform=managed \
  --region=${REGION} \
  --allow-unauthenticated \
  --port=3001 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10 \
  --set-env-vars=GOOGLE_CLOUD_PROJECT=${PROJECT_ID}
```

**Note:** Create Artifact Registry repository first if it doesn't exist:

```bash
gcloud artifacts repositories create ${REPOSITORY} \
  --repository-format=docker \
  --location=${REGION} \
  --account=${ACCOUNT} \
  --project=${PROJECT_ID}
```

**Get service URL after deployment:**

```bash
gcloud run services describe ${SERVICE_NAME} \
  --account=${ACCOUNT} \
  --project=${PROJECT_ID} \
  --region=${REGION} \
  --format="value(status.url)"
```

## Deployment

Deployed to Cloud Run for testing and portfolio demonstration.

**Note:** Deployment URL not published (POC uses `--allow-unauthenticated` with no rate limiting). Available on request for interviews.

## What's Next

- POC #2: RAG Basics (Gemini 2.0 Flash integration)
- POC #3: Agents & Tool Use (multi-source data fusion)
- POC #4: Multi-turn Conversations

## License

MIT
