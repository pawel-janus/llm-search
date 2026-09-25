/**
 * FULL REFRESH: Setup Firestore with SEC filings data.
 *
 * ⚠️  WARNING: This script DELETES ALL existing filings and reloads from BigQuery.
 *
 * Use cases:
 * - First time setup (initializing Firestore)
 * - Changing embeddings logic (mock → Vertex AI)
 * - Yearly cleanup (remove old data + reload fresh)
 *
 * For incremental updates (only new filings), use update-firestore.ts instead.
 *
 * Usage:
 *   npm run build:backend
 *   node packages/backend/dist/scripts/setup-firestore.js
 *
 * Cost: ~$0.007 (275 texts × $0.025/1000 Vertex AI)
 * Time: ~5-10 minutes (embed 275 texts)
 */

import 'dotenv/config';
import { loadSECFilings } from '../data/bigQueryLoader.js';
import { generateMockEmbedding } from '../embeddings/mockEmbeddings.js';
import { storeFilings, clearFilings, getFilingsCount } from '../db/firestore.js';

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  FIRESTORE FULL REFRESH - Setup Script                ║');
  console.log('║  ⚠️  Deletes ALL existing data and reloads from BigQuery ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Check current state
    const existingCount = await getFilingsCount();
    console.log(`[1/5] Current Firestore count: ${existingCount} filings\n`);

    if (existingCount > 0) {
      console.log(`⚠️  WARNING: About to DELETE ${existingCount} existing filings!`);
      console.log('This is a FULL REFRESH - all data will be replaced.\n');

      console.log('[2/5] Clearing Firestore...');
      await clearFilings();
      console.log('✅ Cleared\n');
    } else {
      console.log('[2/5] Firestore is empty (first time setup)\n');
    }

    // 2. Load filings from BigQuery
    console.log('[3/5] Loading filings from BigQuery...');
    const startLoad = Date.now();
    const filings = await loadSECFilings(1000);
    const loadDuration = Date.now() - startLoad;
    console.log(`✅ Loaded ${filings.length} filings in ${loadDuration}ms\n`);

    // 3. Add mock embeddings
    console.log('[4/5] Generating mock embeddings (768D)...');
    const startEmbed = Date.now();
    const filingsWithEmbeddings = filings.map((filing) => ({
      ...filing,
      embedding: generateMockEmbedding(filing.searchable_text),
    }));
    const embedDuration = Date.now() - startEmbed;
    console.log(`✅ Generated ${filingsWithEmbeddings.length} embeddings in ${embedDuration}ms\n`);

    // 4. Store to Firestore
    console.log('[5/5] Storing to Firestore...');
    const startStore = Date.now();
    await storeFilings(filingsWithEmbeddings);
    const storeDuration = Date.now() - startStore;
    console.log(`✅ Stored in ${storeDuration}ms\n`);

    // 5. Verify
    const finalCount = await getFilingsCount();
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ FULL REFRESH COMPLETE                              ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`Total filings in Firestore: ${finalCount}`);
    console.log(`\nNext steps:`);
    console.log(`1. Create vector index in Firestore console (if not exists)`);
    console.log(`   - Field: embedding`);
    console.log(`   - Dimensions: 768`);
    console.log(`   - Distance: COSINE`);
    console.log(`2. Wait for index to build (~2-5 minutes)`);
    console.log(`3. Test /api/search endpoint`);
    console.log(`\nFor incremental updates (only new filings):`);
    console.log(`  node dist/scripts/update-firestore.js`);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
