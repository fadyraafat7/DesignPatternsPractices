
import type { HistoryEntry } from '../../types';

export class HistoryProxy {
  private history: HistoryEntry[] = [];
  private cache: Map<string, HistoryEntry[]> = new Map();
  private readonly maxSize = 50;

  add(entry: HistoryEntry): void {
    this.history.unshift(entry);
    if (this.history.length > this.maxSize) {
      this.history.pop();
    }
    this.invalidateCache();
    console.log(`[Proxy] Entry added. Cache invalidated. Total: ${this.history.length}`);
  }

  private invalidateCache(): void {
    this.cache.clear();
  }

  query(filter: 'all' | 'errors' | string = 'all'): HistoryEntry[] {
    const cacheKey = `filter:${filter}`;
    
    if (this.cache.has(cacheKey)) {
      console.log(`[Proxy] Cache HIT for: ${filter}`);
      return this.cache.get(cacheKey)!;
    }

    console.log(`[Proxy] Cache MISS for: ${filter}`);
    let result: HistoryEntry[];

    if (filter === 'all') {
      result = this.history;
    } else if (filter === 'errors') {
      result = this.history.filter((h) => h.error);
    } else {
      result = this.history.filter((h) => h.expression.includes(filter));
    }

    this.cache.set(cacheKey, result);
    return result;
  }

  getAll(): HistoryEntry[] {
    return this.history;
  }

  clear(): void {
    this.history = [];
    this.invalidateCache();
    console.log('[Proxy] History cleared');
  }

  size(): number {
    return this.history.length;
  }
}