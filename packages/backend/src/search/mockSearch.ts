import { SearchResult } from '@llm-search/shared';
import { mockFilings } from '../data/mockFilings.js';

/**
 * Mock semantic search using simple keyword matching
 * Later: replace with Firestore vector search + Vertex AI embeddings
 */
export async function searchFilings(query: string): Promise<SearchResult[]> {
  const queryLower = query.toLowerCase();
  const queryTokens = queryLower.split(/\s+/);

  // Score each filing based on keyword matches
  const scored = mockFilings.map((filing) => {
    const textLower = filing.searchable_text.toLowerCase();

    // Calculate simple similarity score
    let score = 0;

    // Exact phrase match = highest score
    if (textLower.includes(queryLower)) {
      score += 0.5;
    }

    // Token matches
    for (const token of queryTokens) {
      if (textLower.includes(token)) {
        score += 0.2;
      }
    }

    // Bonus for ticker match
    if (queryLower.includes(filing.ticker.toLowerCase())) {
      score += 0.3;
    }

    // Normalize to 0-1 range
    const similarity = Math.min(score, 1.0);

    return {
      ...filing,
      similarity,
    };
  });

  // Filter and sort by similarity
  const results = scored
    .filter((result) => result.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Top 5 results

  return results;
}
