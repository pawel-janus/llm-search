import { loadSECFilings, type SECFiling } from './bigQueryLoader.js';

/**
 * In-memory cache for SEC filings.
 *
 * Loads data from BigQuery once on startup, then serves from memory.
 * This avoids hitting BigQuery quota on every search request.
 */
class FilingsCache {
  private filings: SECFiling[] = [];
  private loaded: boolean = false;
  private loading: Promise<void> | null = null;

  /**
   * Load filings from BigQuery (idempotent - only loads once).
   */
  async load(): Promise<void> {
    if (this.loaded) {
      return;
    }

    // If already loading, wait for that to complete
    if (this.loading) {
      return this.loading;
    }

    this.loading = (async () => {
      try {
        console.log('[FilingsCache] Loading filings from BigQuery...');
        this.filings = await loadSECFilings(1000);
        this.loaded = true;
        console.log(`[FilingsCache] Cached ${this.filings.length} filings`);
      } catch (error) {
        console.error('[FilingsCache] Failed to load filings:', error);
        throw error;
      } finally {
        this.loading = null;
      }
    })();

    return this.loading;
  }

  /**
   * Get all cached filings.
   *
   * Auto-loads from BigQuery if not yet loaded.
   */
  async getFilings(): Promise<SECFiling[]> {
    if (!this.loaded) {
      await this.load();
    }
    return this.filings;
  }
}

// Singleton instance
export const filingsCache = new FilingsCache();
