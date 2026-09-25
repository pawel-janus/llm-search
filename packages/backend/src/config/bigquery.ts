/**
 * BigQuery configuration for SEC filings data.
 */

/**
 * Baseline date for full data load (YYYYMMDD format).
 *
 * When loading all filings (not incremental), start from this date.
 * Rationale: Pre-2020 data quality varies, 2020+ is standardized.
 */
export const BASELINE_DATE = 20200101; // 2020-01-01

/**
 * Companies to track (CIK identifiers).
 *
 * Imported from cik-ticker-map.ts for query filtering.
 */
export { CIK_TO_TICKER } from './cik-ticker-map.js';
