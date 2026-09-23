import Fastify from 'fastify';
import cors from '@fastify/cors';
import { SearchRequestSchema, SearchResponseSchema } from '@llm-search/shared';
import { searchFilings } from './search/mockSearch.js';

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
app.post<{ Body: unknown }>('/api/search', async (request, reply) => {
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
    // Mock search (later: Firestore vector search)
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
