/**
 * Firestore configuration - database ID, collection names, and constants.
 *
 * Collection naming convention: {poc-name}-{source}-{type}
 * - poc-name: POC identifier (llm-search, llm-rag, llm-agent, etc.)
 * - source: Data source (sec, iex, custom) - optional
 * - type: Data type (filings, prices, conversations, etc.)
 */

/**
 * Firestore database ID for all LLM POCs.
 *
 * Separate database from other project databases (e.g., functions-firestore-auth).
 * All LLM POC-s (#1-4) share this database with namespaced collections.
 */
export const DATABASE_ID = 'llm-pocs';

/**
 * Collection names for each POC.
 *
 * Namespaced to avoid collisions between POCs and clearly identify data ownership.
 */
export const COLLECTIONS = {
  /**
   * POC #1: LLM Search - SEC quarterly filings with embeddings.
   *
   * Contains: 275 SEC filings with 768D embedding vectors for semantic search.
   */
  LLM_SEARCH_SEC_FILINGS: 'llm-search-sec-filings',

  // Future POCs:
  // LLM_RAG_QUERIES: 'llm-rag-queries',
  // LLM_AGENT_SEC_FILINGS: 'llm-agent-sec-filings',
  // LLM_AGENT_IEX_PRICES: 'llm-agent-iex-prices',
  // LLM_CHAT_SESSIONS: 'llm-chat-sessions',
} as const;
