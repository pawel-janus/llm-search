import { SearchResult } from '@llm-search/shared';
import { filingsCache } from '../data/filingsCache.js';

/**
 * Search SEC filings using keyword matching.
 *
 * Data source: BigQuery (cached in memory on startup)
 * TODO: Replace with Firestore vector search + embeddings.
 */
export async function searchFilings(query: string): Promise<SearchResult[]> {
  const lowerQuery = query.toLowerCase();

  // Get filings from cache (loaded from BigQuery)
  const allFilings = await filingsCache.getFilings();

  // Simple keyword matching
  const results = allFilings
    .filter((filing) => filing.searchable_text.toLowerCase().includes(lowerQuery))
    .map((filing) => ({
      ...filing,
      // Mock similarity score based on keyword match
      // TODO: Replace with cosine similarity from embeddings
      similarity: calculateMockSimilarity(filing.searchable_text, query),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  return results;
}

/**
 * Calculate mock similarity score.
 *
 * Simple heuristic until we have real embeddings:
 * - Exact ticker match: 0.9
 * - Contains all query words: 0.7
 * - Contains some query words: 0.5
 */
function calculateMockSimilarity(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const queryWords = lowerQuery.split(' ').filter((w) => w.length > 2);

  // Exact ticker match
  if (lowerText.includes(`(${lowerQuery})`)) {
    return 0.9;
  }

  // Count matching words
  const matchingWords = queryWords.filter((word) => lowerText.includes(word));

  if (matchingWords.length === queryWords.length) {
    return 0.7; // All words match
  } else if (matchingWords.length > 0) {
    return 0.5; // Some words match
  }

  return 0.3; // Weak match
}
