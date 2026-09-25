/**
 * INCREMENTAL UPDATE: Add new SEC filings to Firestore.
 *
 * Loads ONLY new filings since last update and adds them to Firestore.
 * Does NOT delete existing data.
 *
 * Use cases:
 * - Quarterly updates (new Q3 reports published)
 * - Monthly sync (keep data fresh)
 * - Automated cron job (scheduled updates)
 *
 * For full refresh (delete all + reload), use setup-firestore.ts instead.
 *
 * Usage:
 *   npm run build:backend
 *   node packages/backend/dist/scripts/update-firestore.js
 *
 * Cost: ~$0.0005 (20 new texts × $0.025/1000 Vertex AI)
 * Time: ~1-2 minutes (embed 20 texts)
 */

import 'dotenv/config';
import { loadSECFilings } from '../data/bigQueryLoader.js';
import { embedBatch } from '../embeddings/vertexEmbeddings.js';
import { storeFilings, getLastFilingDate, getFilingsCount } from '../db/firestore.js';

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  FIRESTORE INCREMENTAL UPDATE                          ║');
  console.log('║  Adds only NEW filings since last update              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Get current state
    const currentCount = await getFilingsCount();
    console.log(`[1/4] Current Firestore count: ${currentCount} filings\n`);

    if (currentCount === 0) {
      console.log('⚠️  Firestore is empty. Use setup-firestore.js for initial load.\n');
      process.exit(1);
    }

    // 2. Get last filing date from Firestore
    console.log('[2/4] Finding last filing date...');
    const lastDate = await getLastFilingDate();
    console.log(`✅ Last filing date: ${lastDate}\n`);

    // 3. Query BigQuery for NEW filings only
    console.log(`[3/4] Loading NEW filings from BigQuery (after ${lastDate})...`);
    const startLoad = Date.now();
    const newFilings = await loadSECFilings(1000, lastDate); // afterDate parameter
    const loadDuration = Date.now() - startLoad;

    if (newFilings.length === 0) {
      console.log('✅ No new filings found. Database is up to date!\n');
      console.log('╔════════════════════════════════════════════════════════╗');
      console.log('║  ✅ UPDATE COMPLETE - No changes needed               ║');
      console.log('╚════════════════════════════════════════════════════════╝');
      return;
    }

    console.log(`✅ Found ${newFilings.length} new filings in ${loadDuration}ms\n`);

    // 4. Generate Vertex AI embeddings
    console.log('[4/4] Generating embeddings and storing...');
    const startEmbed = Date.now();
    const texts = newFilings.map((f) => f.searchable_text);
    const embeddings = await embedBatch(texts);
    const filingsWithEmbeddings = newFilings.map((filing, i) => ({
      ...filing,
      embedding: embeddings[i],
    }));

    // Store to Firestore (append, not replace)
    await storeFilings(filingsWithEmbeddings);
    const duration = Date.now() - startEmbed;
    console.log(`✅ Added ${newFilings.length} filings in ${duration}ms\n`);

    // 5. Verify
    const finalCount = await getFilingsCount();
    const added = finalCount - currentCount;

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ INCREMENTAL UPDATE COMPLETE                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`Before: ${currentCount} filings`);
    console.log(`Added:  ${added} new filings`);
    console.log(`After:  ${finalCount} filings\n`);

    if (newFilings.length > 0) {
      console.log('Sample of new filings:');
      newFilings.slice(0, 3).forEach((filing, i) => {
        console.log(`  ${i + 1}. ${filing.ticker} - ${filing.tag} (${filing.period})`);
      });
      if (newFilings.length > 3) {
        console.log(`  ... and ${newFilings.length - 3} more`);
      }
    }
  } catch (error) {
    console.error('\n❌ Update failed:', error);
    process.exit(1);
  }
}

main();
