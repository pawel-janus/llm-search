# Firestore Vector Search Setup

## Prerequisites

1. Firestore must be enabled in your GCP project
2. Application Default Credentials (ADC) configured (see SETUP.md)

## Step 1: Load data to Firestore

**Two options: Full Refresh vs Incremental Update**

### Option A: Full Refresh (first time or complete reload)

Use when:
- First time setup
- Changing embeddings logic (mock → Vertex AI)
- Yearly cleanup

```bash
npm run build:backend
cd packages/backend
node dist/scripts/setup-firestore.js
```

**What this does:**
- ⚠️ **DELETES ALL** existing filings from Firestore
- Loads 275 SEC filings from BigQuery (full query)
- Generates mock 768D embeddings for each filing
- Stores to Firestore collection `filings`

**Cost:** ~$0.007 (275 texts × $0.025/1000 Vertex AI)  
**Time:** ~5-10 minutes

**Output:**
```
╔════════════════════════════════════════════════════════╗
║  FIRESTORE FULL REFRESH - Setup Script                ║
║  ⚠️  Deletes ALL existing data and reloads from BigQuery ║
╚════════════════════════════════════════════════════════╝

[1/5] Current Firestore count: 0 filings
[2/5] Firestore is empty (first time setup)
[3/5] Loading filings from BigQuery...
✅ Loaded 275 filings in 1748ms
[4/5] Generating mock embeddings (768D)...
✅ Generated 275 embeddings in 124ms
[5/5] Storing to Firestore...
✅ Stored in 3421ms

╔════════════════════════════════════════════════════════╗
║  ✅ FULL REFRESH COMPLETE                              ║
╚════════════════════════════════════════════════════════╝
Total filings in Firestore: 275
```

### Option B: Incremental Update (quarterly updates)

Use when:
- New quarter reports published (Q3 2024 just came out)
- Monthly sync to keep data fresh
- Automated cron job

```bash
npm run build:backend
cd packages/backend
node dist/scripts/update-firestore.js
```

**What this does:**
- Finds last filing_date in Firestore (e.g. "2024-08-01")
- Queries BigQuery ONLY for filings after that date
- Generates embeddings for NEW filings only
- Appends to Firestore (does NOT delete existing data)

**Cost:** ~$0.0005 (20 new texts × $0.025/1000 Vertex AI)  
**Time:** ~1-2 minutes

**Output:**
```
╔════════════════════════════════════════════════════════╗
║  FIRESTORE INCREMENTAL UPDATE                          ║
║  Adds only NEW filings since last update              ║
╚════════════════════════════════════════════════════════╝

[1/4] Current Firestore count: 275 filings
[2/4] Finding last filing date...
✅ Last filing date: 2024-08-01
[3/4] Loading NEW filings from BigQuery (after 2024-08-01)...
✅ Found 23 new filings in 892ms
[4/4] Generating embeddings and storing...
✅ Added 23 filings in 1245ms

╔════════════════════════════════════════════════════════╗
║  ✅ INCREMENTAL UPDATE COMPLETE                        ║
╚════════════════════════════════════════════════════════╝
Before: 275 filings
Added:  23 new filings
After:  298 filings

Sample of new filings:
  1. AAPL - Revenues (2024-Q4)
  2. MSFT - NetIncomeLoss (2024-Q4)
  3. GOOGL - Assets (2024-Q4)
  ... and 20 more
```

**If no new filings:**
```
✅ No new filings found. Database is up to date!
╔════════════════════════════════════════════════════════╗
║  ✅ UPDATE COMPLETE - No changes needed               ║
╚════════════════════════════════════════════════════════╝
```

## Step 2: Create Vector Index

Firestore requires a vector index to perform `findNearest()` queries.

### Option A: Firebase Console (Web UI)

1. Go to: https://console.firebase.google.com
2. Select project: `native-dev-506112` (or your project)
3. Navigate to: **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Configure:
   - **Collection ID:** `llm-search-sec-filings`
   - **Fields:**
     - `embedding` - **Vector** - Dimensions: `768` - Distance: **COSINE**
   - **Query scope:** Collection
6. Click **Create**

**Index build time:** ~2-5 minutes for 275 documents

### Option B: gcloud CLI

```bash
# Create index config file
cat > firestore-index.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "filings",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "embedding",
          "vector": {
            "dimension": 768,
            "flat": {}
          }
        }
      ]
    }
  ]
}
EOF

# Create index
gcloud firestore indexes composite create \
  --field-config=embedding=VECTOR,768,COSINE \
  --collection-group=llm-search-sec-filings \
  --project=native-dev-506112 \
  --account=paweljanus.gcp@gmail.com
```

### Option C: Firebase CLI

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy index
firebase deploy --only firestore:indexes --project native-dev-506112
```

## Step 3: Verify Index

Check index status:

```bash
gcloud firestore indexes composite list \
  --project=native-dev-506112 \
  --account=paweljanus.gcp@gmail.com
```

**Expected output:**
```
INDEX_ID  COLLECTION                FIELDS              STATE
abc123    llm-search-sec-filings    embedding(VECTOR)   READY
```

**State transitions:**
- `CREATING` → Index building (~2-5 min)
- `READY` → Index ready to use ✅

## Step 4: Test Vector Search

Start backend and test search:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Test
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Apple revenue"}'
```

**Expected response:**
```json
{
  "query": "Apple revenue",
  "results": [
    {
      "ticker": "AAPL",
      "name": "APPLE INC",
      "tag": "Revenues",
      "value": 394328000000,
      "period": "2024-Q3",
      "filing_date": "2024-08-01",
      "searchable_text": "APPLE INC (AAPL) Revenues: $394328000000 2024-Q3",
      "similarity": 0.87
    }
    // ... 4 more results
  ],
  "count": 5,
  "latency_ms": 250
}
```

**Note:** With mock embeddings, similarity scores are based on text hash similarity (not semantic). Replace with real Vertex AI embeddings for production-quality results.

## Troubleshooting

### Error: "5 NOT_FOUND" or "Collection not found"

**Problem:** Firestore collection doesn't exist yet (setup script not run).

**Solution:**
```bash
# Run setup script first
npm run build:backend
cd packages/backend
node dist/scripts/setup-firestore.js
```

Then create vector index (Step 2) and retry search.

### Error: "The query requires an index"

**Problem:** Vector index not created or not ready yet.

**Solution:**
1. Check index status (Step 3)
2. Wait for `READY` state (~2-5 min after creation)
3. If stuck in `CREATING` for >10 min, delete and recreate

### Error: "embedding must be a list of floats"

**Problem:** Embedding field has wrong data type.

**Solution:**
1. Clear Firestore: `node dist/scripts/setup-firestore.js` (auto-clears)
2. Re-run setup script
3. Verify document structure in Firestore console

### Error: "findNearest is not a function"

**Problem:** Outdated firebase-admin SDK.

**Solution:**
```bash
npm install firebase-admin@latest --workspace=packages/backend
npm run build:backend
```

## Next Steps

After Firestore vector search works with mock embeddings:

1. **Replace mock embeddings with Vertex AI:**
   - Update `setup-firestore.ts` to use `embedText()` from `vertexEmbeddings.ts`
   - Re-run setup script
   - Cost: ~$0.007 (275 texts × $0.025/1000)

2. **Update search endpoint:**
   - Replace `generateMockEmbedding(query)` with `embedText(query)` in `firestoreSearch.ts`

3. **Test semantic search:**
   - Query: "tech company profits" → should find "NetIncomeLoss" filings
   - Query: "AAPL earnings" → should find "Apple Inc Revenues"

## Cost

**Firestore:**
- Storage: 275 docs × ~2KB = 0.5 MB (FREE tier: 1 GB)
- Reads: ~100 searches/day × 30 days = 3K reads (FREE tier: 50K reads/day)
- **Monthly cost: $0**

**Vertex AI (when enabled):**
- Embeddings: 275 texts one-time = ~$0.007
- Query embeddings: ~100 queries/day = ~$0.08/month
- **Monthly cost: ~$0.08**

Total POC cost: **~$0.08/month** 🎯
