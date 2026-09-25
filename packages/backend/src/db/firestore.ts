import admin from 'firebase-admin';
import { DATABASE_ID, COLLECTIONS } from '../config/firestore.js';

const projectId = process.env.GOOGLE_CLOUD_PROJECT;

if (!projectId) {
  throw new Error('GOOGLE_CLOUD_PROJECT environment variable is required');
}

// Initialize Firebase Admin SDK
// Uses Application Default Credentials (ADC) automatically
if (!admin.apps.length) {
  admin.initializeApp({
    projectId,
  });
}

// Use dedicated database for LLM POCs (separate from other project databases)
const db = admin.firestore();
db.settings({ databaseId: DATABASE_ID });

export { db };

/**
 * Firestore batch size limit.
 * Max docs per batch to avoid "Transaction too big" error (10 MB limit).
 */
const BATCH_SIZE = 50;

/**
 * SEC filing document in Firestore.
 */
export interface FilingDocument {
  ticker: string;
  name: string;
  tag: string;
  value: number;
  period: string;
  filing_date: string;
  searchable_text: string;
  embedding: number[]; // 768D vector
  created_at: admin.firestore.Timestamp;
}

/**
 * Search result with similarity score.
 */
export interface SearchResult {
  ticker: string;
  name: string;
  tag: string;
  value: number;
  period: string;
  filing_date: string;
  searchable_text: string;
  similarity: number; // Cosine similarity (0-1)
}

/**
 * Store filings to Firestore with embeddings.
 *
 * Processes in batches to avoid Firestore "Transaction too big" error.
 * Max batch size: 50 documents (with 768D embeddings = ~325 KB per batch).
 *
 * @param filings - Array of filings with embeddings
 */
export async function storeFilings(
  filings: Array<Omit<FilingDocument, 'created_at'>>
): Promise<void> {
  const collection = db.collection(COLLECTIONS.LLM_SEARCH_SEC_FILINGS);

  console.log(`[Firestore] Storing ${filings.length} filings in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < filings.length; i += BATCH_SIZE) {
    const batchFilings = filings.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const filing of batchFilings) {
      const docRef = collection.doc(); // Auto-generate ID
      batch.set(docRef, {
        ticker: filing.ticker,
        name: filing.name,
        tag: filing.tag,
        value: filing.value,
        period: filing.period,
        filing_date: filing.filing_date,
        searchable_text: filing.searchable_text,
        embedding: admin.firestore.FieldValue.vector(filing.embedding), // Vector type!
        created_at: admin.firestore.Timestamp.now(),
      });
    }

    await batch.commit();
    const progress = Math.min(i + BATCH_SIZE, filings.length);
    console.log(`[Firestore] Progress: ${progress}/${filings.length}`);
  }

  console.log(`[Firestore] Stored ${filings.length} filings successfully`);
}

/**
 * Search filings using Firestore vector search.
 *
 * Performs cosine similarity search on embedding field.
 *
 * @param queryEmbedding - 768D query embedding vector
 * @param limit - Max number of results (default: 5)
 * @returns Array of search results with similarity scores
 */
export async function searchFilingsByVector(
  queryEmbedding: number[],
  limit: number = 5
): Promise<SearchResult[]> {
  console.log(`[Firestore] Vector search (limit: ${limit})...`);

  const startTime = Date.now();

  // Firestore vector search
  const vectorQuery = db.collection(COLLECTIONS.LLM_SEARCH_SEC_FILINGS).findNearest({
    vectorField: 'embedding',
    queryVector: queryEmbedding,
    limit,
    distanceMeasure: 'COSINE',
    distanceResultField: 'distance', // Store distance in result
  });

  const snapshot = await vectorQuery.get();

  const duration = Date.now() - startTime;
  console.log(`[Firestore] Found ${snapshot.docs.length} results in ${duration}ms`);

  // Convert Firestore docs to SearchResult
  return snapshot.docs.map((doc) => {
    const data = doc.data() as FilingDocument;

    // Firestore returns distance (0 = identical, 2 = opposite)
    // Convert to similarity (1 = identical, 0 = opposite)
    const distance = (data as any).distance || (doc as any)._distance || 0;
    const similarity = 1 - distance / 2;

    return {
      ticker: data.ticker,
      name: data.name,
      tag: data.tag,
      value: data.value,
      period: data.period,
      filing_date: data.filing_date,
      searchable_text: data.searchable_text,
      similarity: Math.max(0, Math.min(1, similarity)), // Clamp to [0, 1]
    };
  });
}

/**
 * Clear all filings from Firestore.
 *
 * WARNING: Deletes all documents in collection.
 * Processes in batches to avoid "Transaction too big" error.
 */
export async function clearFilings(): Promise<void> {
  const collection = db.collection(COLLECTIONS.LLM_SEARCH_SEC_FILINGS);
  const snapshot = await collection.get();

  console.log(`[Firestore] Deleting ${snapshot.docs.length} filings in batches of ${BATCH_SIZE}...`);

  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const batchDocs = docs.slice(i, i + BATCH_SIZE);

    batchDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    const progress = Math.min(i + BATCH_SIZE, docs.length);
    console.log(`[Firestore] Deleted: ${progress}/${docs.length}`);
  }

  console.log('[Firestore] All filings deleted');
}

/**
 * Get total count of filings in Firestore.
 */
export async function getFilingsCount(): Promise<number> {
  const snapshot = await db.collection(COLLECTIONS.LLM_SEARCH_SEC_FILINGS).count().get();
  return snapshot.data().count;
}

/**
 * Get the most recent filing_date from Firestore.
 *
 * Used for incremental updates - query BigQuery for filings after this date.
 *
 * @returns Most recent filing date (YYYY-MM-DD format)
 */
export async function getLastFilingDate(): Promise<string> {
  const snapshot = await db
    .collection(COLLECTIONS.LLM_SEARCH_SEC_FILINGS)
    .orderBy('filing_date', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error('No filings found in Firestore');
  }

  const lastFiling = snapshot.docs[0].data() as FilingDocument;
  return lastFiling.filing_date;
}
