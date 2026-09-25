import { SearchResult } from '@llm-search/shared';
import { searchFilingsByVector } from '../db/firestore.js';
import { generateMockEmbedding } from '../embeddings/mockEmbeddings.js';

/**
 * Search SEC filings using Firestore vector search.
 *
 * Currently uses MOCK query embeddings for testing Firestore vector search.
 * TODO: Replace with real Vertex AI embeddings.
 *
 * @param query - User search query
 * @returns Top 5 most similar filings
 */
export async function searchFilings(query: string): Promise<SearchResult[]> {
  // TODO: Replace with Vertex AI embedText(query)
  const queryEmbedding = generateMockEmbedding(query);

  // Firestore vector search
  const results = await searchFilingsByVector(queryEmbedding, 5);

  return results;
}
