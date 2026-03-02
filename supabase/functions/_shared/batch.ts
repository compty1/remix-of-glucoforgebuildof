/**
 * Phase 4: Batch processing utilities for edge functions.
 * Covers: 4.10 (batch processing), 4.13 (deadlock prevention via batched deletes).
 */

/**
 * Process items in batches with concurrency control.
 * Prevents overloading the database with too many concurrent operations.
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: { batchSize?: number; delayMs?: number; onError?: 'skip' | 'throw' } = {}
): Promise<{ results: R[]; errors: Array<{ index: number; error: string }> }> {
  const { batchSize = 50, delayMs = 100, onError = 'skip' } = options;
  const results: R[] = [];
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchPromises = batch.map((item, idx) =>
      processor(item, i + idx)
        .then(r => ({ ok: true as const, value: r, index: i + idx }))
        .catch(err => ({ ok: false as const, error: String(err), index: i + idx }))
    );

    const batchResults = await Promise.all(batchPromises);

    for (const r of batchResults) {
      if (r.ok) {
        results.push(r.value);
      } else {
        errors.push({ index: r.index, error: r.error });
        if (onError === 'throw') throw new Error(`Batch item ${r.index} failed: ${r.error}`);
      }
    }

    // Delay between batches to prevent deadlocks
    if (i + batchSize < items.length && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return { results, errors };
}

/**
 * Batched delete to prevent deadlocks (Phase 4.13).
 * Deletes rows in small batches with delays between.
 */
export async function batchedDelete(
  supabase: any,
  table: string,
  filterColumn: string,
  filterValues: string[],
  batchSize = 100
): Promise<{ deletedCount: number; errors: string[] }> {
  let deletedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < filterValues.length; i += batchSize) {
    const batch = filterValues.slice(i, i + batchSize);
    const { error, count } = await supabase
      .from(table)
      .delete({ count: 'exact' })
      .in(filterColumn, batch);

    if (error) {
      errors.push(`Batch ${Math.floor(i / batchSize)}: ${error.message}`);
    } else {
      deletedCount += count || 0;
    }

    // Small delay to prevent lock contention
    if (i + batchSize < filterValues.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  return { deletedCount, errors };
}
