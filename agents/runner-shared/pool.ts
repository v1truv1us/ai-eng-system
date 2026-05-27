/**
 * Simple bounded-concurrency async pool.
 *
 * Runs tasks with at most `concurrency` in-flight at once.
 * Replaces unbounded Promise.all(templates.map(...)) patterns.
 */

export async function mapLimit<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]!, i);
    }
  }

  const workers: Promise<void>[] = [];
  for (let w = 0; w < Math.min(concurrency, items.length); w++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}
