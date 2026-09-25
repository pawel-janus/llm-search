import { SearchResult } from '@llm-search/shared';
import { searchFilingsByVector } from '../db/firestore.js';
import { embedText } from '../embeddings/vertexEmbeddings.js';

/**
 * Search SEC filings using Firestore vector search.
 *
 * Uses Vertex AI text-embedding-004 for query embeddings.
 * Returns top 5 most similar filings based on cosine similarity.
 *
 * @param query - User search query
 * @returns Top 5 most similar filings
 */
export async function searchFilings(query: string): Promise<SearchResult[]> {
  // Generate Vertex AI embedding for query
  const queryEmbedding = await embedText(query);

  // Firestore vector search
  const results = await searchFilingsByVector(queryEmbedding, 5);

  return results;
}
