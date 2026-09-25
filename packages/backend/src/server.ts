// Load environment variables from .env file
import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { SearchRequestSchema, SearchResponseSchema, type SearchRequest } from '@llm-search/shared';
import { searchFilings } from './search/firestoreSearch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Fastify({
  logger: {
    level: 'info',
  },
});

// CORS for frontend
await app.register(cors, {
  origin: true,
});

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Search endpoint
app.post<{ Body: SearchRequest }>('/api/search', async (request, reply) => {
  const startTime = Date.now();

  // Validate request with Zod
  const parseResult = SearchRequestSchema.safeParse(request.body);

  if (!parseResult.success) {
    return reply.code(400).send({
      error: parseResult.error.errors[0].message,
      statusCode: 400,
    });
  }

  const { query } = parseResult.data;

  try {
    // Firestore vector search (with mock embeddings for now)
    const results = await searchFilings(query);

    const latency_ms = Date.now() - startTime;

    // Validate response with Zod
    const response = SearchResponseSchema.parse({
      query,
      results,
      count: results.length,
      latency_ms,
    });

    return response;
  } catch (error) {
    app.log.error(error, 'Search failed');
    return reply.code(500).send({
      error: error instanceof Error ? error.message : 'Internal server error',
      statusCode: 500,
    });
  }
});

// Serve frontend static files (production only, dev uses Vite dev server)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

await app.register(fastifyStatic, {
  root: frontendDistPath,
  prefix: '/',
  // Wildcard route - serve index.html for all non-API routes (SPA routing)
  wildcard: false,
});

// SPA fallback - serve index.html for all non-API routes
app.setNotFoundHandler(async (request, reply) => {
  // If request is for API, return 404 JSON
  if (request.url.startsWith('/api') || request.url.startsWith('/health')) {
    return reply.code(404).send({ error: 'Not found', statusCode: 404 });
  }

  // Otherwise serve index.html (SPA routing)
  return reply.sendFile('index.html');
});

// Start server
const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '0.0.0.0';

try {
  await app.listen({ port, host });
  app.log.info(`Server listening on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
