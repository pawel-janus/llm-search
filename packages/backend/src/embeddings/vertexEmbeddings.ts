import { GoogleGenAI } from '@google/genai';

const projectId = process.env.GOOGLE_CLOUD_PROJECT;

if (!projectId) {
  throw new Error('GOOGLE_CLOUD_PROJECT environment variable is required');
}

// Initialize Google Gen AI SDK with Vertex AI (GCP)
const ai = new GoogleGenAI({
  vertexai: true, // Enable Vertex AI integration
  project: projectId,
  location: 'europe-west4', // Netherlands - closest to europe-central2 (Warsaw)
});

/**
 * Embed single text using Vertex AI Text Embeddings API.
 *
 * Uses text-embedding-004 model (768D vectors).
 *
 * @param text - Text to embed
 * @returns 768-dimensional embedding vector
 */
export async function embedText(text: string): Promise<number[]> {
  const result = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
  });

  // Nowe SDK zawsze zwraca tablicę w polu result.embeddings
  if (!result.embeddings || result.embeddings.length === 0) {
    throw new Error('No embedding returned from Vertex AI');
  }

  // Pobieramy wartości (values) z pierwszego elementu tablicy
  const embeddingValues = result.embeddings[0].values;

  if (!embeddingValues) {
    throw new Error('Embedding values are undefined');
  }

  // text-embedding-004 returns 768D vector
  return embeddingValues;
}

/**
 * Embed batch of texts using Vertex AI.
 *
 * Processes texts in batches to respect API limits.
 *
 * @param texts - Array of texts to embed
 * @returns Array of 768D embedding vectors
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 5; // Conservative batch size for API limits
  const embeddings: number[][] = [];

  console.log(`[VertexAI] Embedding ${texts.length} texts in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const batchStart = Date.now();

    // Process batch in parallel
    const batchEmbeddings = await Promise.all(
      batch.map(text => embedText(text))
    );

    embeddings.push(...batchEmbeddings);

    const batchDuration = Date.now() - batchStart;
    const progress = Math.min(i + BATCH_SIZE, texts.length);
    console.log(`[VertexAI] Progress: ${progress}/${texts.length} (${batchDuration}ms for ${batch.length} texts)`);
  }

  console.log(`[VertexAI] Embedded ${texts.length} texts total`);
  return embeddings;
}

/**
 * Test Vertex AI connection.
 */
export async function testVertexAI(): Promise<boolean> {
  try {
    const testText = 'Hello, world!';
    const embedding = await embedText(testText);

    // text-embedding-004 should return 768D vector
    if (!Array.isArray(embedding) || embedding.length !== 768) {
      console.error(`[VertexAI] Unexpected embedding dimension: ${embedding.length} (expected 768)`);
      return false;
    }

    console.log(`[VertexAI] Connection OK - embedding dimension: ${embedding.length}D`);
    return true;
  } catch (error) {
    console.error('[VertexAI] Connection test failed:', error);
    return false;
  }
}
