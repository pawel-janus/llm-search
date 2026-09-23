import { Filing } from '@llm-search/shared';

// Mock SEC quarterly filings data
export const mockFilings: Filing[] = [
  // Apple Inc.
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    tag: 'Revenues',
    value: 394328000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Apple Inc. (AAPL) Revenues: $394328000000 2024-Q3',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    tag: 'NetIncomeLoss',
    value: 25000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Apple Inc. (AAPL) NetIncomeLoss: $25000000000 2024-Q3',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    tag: 'Revenues',
    value: 385000000000,
    period: '2024-Q2',
    filing_date: '2024-06-30',
    searchable_text: 'Apple Inc. (AAPL) Revenues: $385000000000 2024-Q2',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    tag: 'NetIncomeLoss',
    value: 23000000000,
    period: '2024-Q2',
    filing_date: '2024-06-30',
    searchable_text: 'Apple Inc. (AAPL) NetIncomeLoss: $23000000000 2024-Q2',
  },

  // Microsoft
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    tag: 'Revenues',
    value: 65000000000,
    period: '2024-Q3',
    filing_date: '2024-09-28',
    searchable_text: 'Microsoft Corporation (MSFT) Revenues: $65000000000 2024-Q3',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    tag: 'NetIncomeLoss',
    value: 22000000000,
    period: '2024-Q3',
    filing_date: '2024-09-28',
    searchable_text: 'Microsoft Corporation (MSFT) NetIncomeLoss: $22000000000 2024-Q3',
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    tag: 'Revenues',
    value: 62000000000,
    period: '2024-Q2',
    filing_date: '2024-06-30',
    searchable_text: 'Microsoft Corporation (MSFT) Revenues: $62000000000 2024-Q2',
  },

  // Google
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    tag: 'Revenues',
    value: 85000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Alphabet Inc. (GOOGL) Revenues: $85000000000 2024-Q3',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    tag: 'NetIncomeLoss',
    value: 18000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Alphabet Inc. (GOOGL) NetIncomeLoss: $18000000000 2024-Q3',
  },

  // Tesla
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    tag: 'Revenues',
    value: 25000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Tesla Inc. (TSLA) Revenues: $25000000000 2024-Q3',
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    tag: 'NetIncomeLoss',
    value: 3000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Tesla Inc. (TSLA) NetIncomeLoss: $3000000000 2024-Q3',
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    tag: 'Liabilities',
    value: 45000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Tesla Inc. (TSLA) Liabilities: $45000000000 2024-Q3',
  },

  // Meta
  {
    ticker: 'META',
    name: 'Meta Platforms Inc.',
    tag: 'Revenues',
    value: 40000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Meta Platforms Inc. (META) Revenues: $40000000000 2024-Q3',
  },
  {
    ticker: 'META',
    name: 'Meta Platforms Inc.',
    tag: 'NetIncomeLoss',
    value: 12000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Meta Platforms Inc. (META) NetIncomeLoss: $12000000000 2024-Q3',
  },

  // Amazon
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    tag: 'Revenues',
    value: 158000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Amazon.com Inc. (AMZN) Revenues: $158000000000 2024-Q3',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    tag: 'NetIncomeLoss',
    value: 15000000000,
    period: '2024-Q3',
    filing_date: '2024-09-30',
    searchable_text: 'Amazon.com Inc. (AMZN) NetIncomeLoss: $15000000000 2024-Q3',
  },
];
