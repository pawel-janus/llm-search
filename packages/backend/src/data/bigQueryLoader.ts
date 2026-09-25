import { BigQuery } from '@google-cloud/bigquery';
import { CIK_TO_TICKER } from '../config/cik-ticker-map.js';

// Use your project as billing project for public dataset queries
const bq = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});

export interface SECFiling {
  ticker: string;
  name: string;
  tag: string;
  value: number;
  period: string;
  filing_date: string;
  searchable_text: string;
}

/**
 * Load SEC quarterly filings from BigQuery public dataset.
 *
 * Dataset: bigquery-public-data.sec_quarterly_financials.quick_summary
 * Note: Dataset schema changed - using quick_summary instead of filing_tag
 *
 * @param limit Max number of filings to load (default: 1000)
 * @returns Array of SEC filings
 */
export async function loadSECFilings(limit: number = 1000): Promise<SECFiling[]> {
  const ciks = Object.keys(CIK_TO_TICKER).join(', ');

  const query = `
    SELECT
      company_name,
      central_index_key,
      measure_tag,
      value,
      period_end_date,
      fiscal_period_focus,
      date_filed,
      units
    FROM \`bigquery-public-data.sec_quarterly_financials.quick_summary\`
    WHERE central_index_key IN (${ciks})
      AND measure_tag IN ('Revenues', 'NetIncomeLoss', 'Assets', 'Liabilities')
      AND fiscal_period_focus IN ('Q1', 'Q2', 'Q3', 'Q4', 'FY')
      AND date_filed >= 20200101
      AND units = 'USD'
    ORDER BY date_filed DESC
    LIMIT @limit
  `;

  const options = {
    query,
    params: { limit },
    location: 'US', // Public datasets are in multi-region US
    useLegacySql: false,
  };

  console.log(`[BigQuery] Loading SEC filings (limit: ${limit})...`);
  const startTime = Date.now();

  const [rows] = await bq.query(options);

  const duration = Date.now() - startTime;
  console.log(`[BigQuery] Loaded ${rows.length} filings in ${duration}ms`);

  return rows.map((row: any) => {
    const ticker = CIK_TO_TICKER[row.central_index_key] || 'UNKNOWN';
    const period = formatPeriod(row.period_end_date, row.fiscal_period_focus);
    const filing_date = formatDate(row.date_filed);

    return {
      ticker,
      name: row.company_name,
      tag: row.measure_tag,
      value: parseFloat(row.value),
      period,
      filing_date,
      searchable_text: `${row.company_name} (${ticker}) ${row.measure_tag}: $${row.value} ${period}`,
    };
  });
}

/**
 * Format period_end_date (20240331) + fiscal_period_focus (Q1) → "2024-Q1"
 */
function formatPeriod(date: string | number, quarter: string): string {
  const dateStr = String(date);
  const year = dateStr.substring(0, 4);
  return `${year}-${quarter}`;
}

/**
 * Format date_filed (20240315) → "2024-03-15"
 */
function formatDate(date: number): string {
  const dateStr = String(date);
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
}

/**
 * Get sample query to verify BigQuery connection.
 */
export async function testBigQueryConnection(): Promise<boolean> {
  try {
    const query = 'SELECT 1 as test';
    const [rows] = await bq.query({ query });
    return rows.length === 1 && rows[0].test === 1;
  } catch (error) {
    console.error('[BigQuery] Connection test failed:', error);
    return false;
  }
}
