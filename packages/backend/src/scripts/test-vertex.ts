/**
 * Test Vertex AI embeddings connection.
 *
 * Usage:
 *   npm run build:backend
 *   node packages/backend/dist/scripts/test-vertex.js
 */

import 'dotenv/config';
import { embedText, testVertexAI } from '../embeddings/vertexEmbeddings.js';

async function main() {
  console.log('[Test] Testing Vertex AI connection...\n');

  // 1. Connection test
  const connectionOk = await testVertexAI();
  if (!connectionOk) {
    console.error('\n[Test] ❌ Connection failed');
    process.exit(1);
  }

  console.log('\n[Test] ✅ Connection OK\n');

  // 2. Sample embeddings
  const samples = [
    'Apple Inc. (AAPL) Revenues: $394328000000 2024-Q3',
    'Microsoft Corporation (MSFT) NetIncomeLoss: $22000000000 2024-Q2',
  ];

  console.log('[Test] Embedding sample texts...\n');

  for (const text of samples) {
    const start = Date.now();
    const embedding = await embedText(text);
    const duration = Date.now() - start;

    console.log(`Text: "${text.substring(0, 60)}..."`);
    console.log(`Embedding: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...] (${embedding.length}D)`);
    console.log(`Duration: ${duration}ms\n`);
  }

  console.log('[Test] ✅ All tests passed');
}

main().catch(error => {
  console.error('[Test] Error:', error);
  process.exit(1);
});
