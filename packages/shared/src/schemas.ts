import { z } from 'zod';

// SEC Filing schema
export const FilingSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  tag: z.string(),
  value: z.number(),
  period: z.string(),
  filing_date: z.string(),
  searchable_text: z.string(),
});

export type Filing = z.infer<typeof FilingSchema>;

// Search result schema (Filing + similarity score)
export const SearchResultSchema = FilingSchema.extend({
  similarity: z.number().min(0).max(1),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// API Request schemas
export const SearchRequestSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters'),
});

export type SearchRequest = z.infer<typeof SearchRequestSchema>;

// API Response schemas
export const SearchResponseSchema = z.object({
  query: z.string(),
  results: z.array(SearchResultSchema),
  count: z.number(),
  latency_ms: z.number().optional(),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export const ErrorResponseSchema = z.object({
  error: z.string(),
  statusCode: z.number().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
