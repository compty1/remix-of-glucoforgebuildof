/**
 * Phase 4: Pagination and query optimization utilities.
 * Covers: 4.4 (pagination), 4.3 (query optimization helpers).
 */
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/** Standard pagination schema for edge function requests. */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/** Calculate offset from page + limit. */
export function getOffset(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}

/** Build a standard paginated response envelope. */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
) {
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
      hasMore: params.page * params.limit < total,
    },
  };
}

/**
 * Parse pagination params from URL search params.
 */
export function parsePaginationFromURL(url: URL): PaginationParams {
  return paginationSchema.parse({
    page: url.searchParams.get('page') || 1,
    limit: url.searchParams.get('limit') || 20,
    sort_by: url.searchParams.get('sort_by') || undefined,
    sort_order: url.searchParams.get('sort_order') || 'desc',
  });
}

/**
 * Apply pagination to a Supabase query builder.
 * Returns the query with .range() applied.
 */
export function applyPagination(query: any, params: PaginationParams): any {
  const from = getOffset(params);
  const to = from + params.limit - 1;
  let q = query.range(from, to);
  if (params.sort_by) {
    q = q.order(params.sort_by, { ascending: params.sort_order === 'asc' });
  }
  return q;
}
