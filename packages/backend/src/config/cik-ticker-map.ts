/**
 * CIK (Central Index Key) to Stock Ticker mapping.
 *
 * SEC uses CIK numbers as unique identifiers for companies.
 * This maps CIK to human-readable stock tickers for major tech companies.
 *
 * Source: https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany
 */
export const CIK_TO_TICKER: Record<number, string> = {
  320193: 'AAPL',    // Apple Inc.
  789019: 'MSFT',    // Microsoft Corporation
  1652044: 'GOOGL',  // Alphabet Inc. (Google)
  1018724: 'AMZN',   // Amazon.com Inc.
  1326801: 'META',   // Meta Platforms Inc. (Facebook)
  1045810: 'NVDA',   // NVIDIA Corporation
  1318605: 'TSLA',   // Tesla Inc.
  1065280: 'NFLX',   // Netflix Inc.
  1341439: 'ORCL',   // Oracle Corporation
  51143: 'IBM',      // International Business Machines
};
