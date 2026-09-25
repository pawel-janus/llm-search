/**
 * Generate mock 768D embedding vector for testing Firestore vector search.
 *
 * Uses deterministic hash of input text to generate consistent vectors.
 * This allows testing Firestore vector search mechanism before integrating
 * real Vertex AI embeddings.
 *
 * @param text - Input text
 * @returns 768-dimensional mock embedding vector
 */
export function generateMockEmbedding(text: string): number[] {
  const DIMENSION = 768;
  const embedding: number[] = [];

  // Simple hash function (not cryptographic, just for mock data)
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate 768D vector from hash
  // Use different offsets to create variation across dimensions
  for (let i = 0; i < DIMENSION; i++) {
    const seed = hash + i * 12345;
    // Generate pseudo-random float in range [-1, 1]
    const value = (Math.sin(seed) + Math.cos(seed * 0.5)) / 2;
    embedding.push(value);
  }

  // Normalize vector to unit length (required for cosine similarity)
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0)
  );

  return embedding.map((val) => val / magnitude);
}

/**
 * Generate batch of mock embeddings.
 *
 * @param texts - Array of texts
 * @returns Array of 768D mock embedding vectors
 */
export function generateMockEmbeddingBatch(texts: string[]): number[][] {
  return texts.map((text) => generateMockEmbedding(text));
}
